// Service Integrado - Planejamento Semanal + Maquinas + Pedidos
// Sistema Soropel - Gestao de Producao Completa

import { supabase } from '@/config/supabase'
import type {
  WeeklyPlanningComplete,
  PlannedOrderItem,
  MachineWithPlanning,
  OrderForPlanning,
  WeeklyPlanningUpdate,
  ProductionMetrics,
  PlanningValidation
} from '@/types/integratedPlanning'

class IntegratedPlanningService {
  
  // Verificar disponibilidade do Supabase
  private isSupabaseAvailable(): boolean {
    return Boolean(supabase)
  }

  // Buscar planejamento completo da semana com status das maquinas
  async getWeeklyPlanningWithMachineStatus(weekStart: string): Promise<{
    success: boolean
    data?: {
      planning: WeeklyPlanningComplete[]
      machines: MachineWithPlanning[]
      availableOrders: OrderForPlanning[]
      metrics: ProductionMetrics
    }
    error?: string
  }> {
    if (!this.isSupabaseAvailable()) {
      return { success: false, error: 'Supabase não disponível' }
    }

    try {
      console.log('Carregando planejamento integrado para semana:', weekStart)

      // 1. Buscar planejamentos da semana
      const { data: plannings, error: planningError } = await supabase
        .from('weekly_planning')
        .select(`
          *,
          machines(
            id,
            machine_number,
            name,
            type,
            status,
            capacity_per_hour
          )
        `)
        .eq('week_start_date', weekStart)

      if (planningError) {
        throw new Error(`Erro ao buscar planejamentos: ${planningError.message}`)
      }

      // 2. Buscar pedidos ativos e pendentes
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select(`
          id,
          order_number,
          priority,
          delivery_date,
          status,
          customer:customers(name),
          order_items(
            id,
            quantity,
            progress_percentage,
            planned_machine_id,
            product:products(name, soropel_code)
          )
        `)
        .in('status', ['pending', 'planned', 'in_production'])
        .order('delivery_date', { ascending: true })

      if (ordersError) {
        throw new Error(`Erro ao buscar pedidos: ${ordersError.message}`)
      }

      // 3. Buscar status atual das maquinas
      const { data: machines, error: machinesError } = await supabase
        .from('machines')
        .select(`
          *,
          current_bobina:bobinas(reel_number, paper_type),
          machine_status(efficiency_current, progress_percentage)
        `)
        .eq('active', true)
        .order('machine_number')

      if (machinesError) {
        throw new Error(`Erro ao buscar máquinas: ${machinesError.message}`)
      }

      // 4. Processar e combinar dados
      const processedData = this.processIntegratedData(
        plannings || [],
        orders || [],
        machines || [],
        weekStart
      )

      return {
        success: true,
        data: processedData
      }

    } catch (error) {
      console.error('Erro no planejamento integrado:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      }
    }
  }

  // Processar e combinar dados de diferentes tabelas
  private processIntegratedData(plannings: any[], orders: any[], machines: any[], weekStart: string) {
    // Converter pedidos para formato de planejamento
    const availableOrders: OrderForPlanning[] = orders.flatMap(order => 
      order.order_items.map(item => ({
        id: item.id,
        order_number: order.order_number,
        client_id: order.customer?.id || '',
        client_name: order.customer?.name || 'Cliente não identificado',
        product_id: item.product?.id || '',
        product_name: item.product?.name || 'Produto',
        product_code: item.product?.soropel_code || 0,
        quantity: item.quantity,
        priority: order.priority,
        delivery_date: order.delivery_date,
        status: order.status,
        estimated_hours: this.calculateEstimatedHours(item.quantity, item.product?.name),
        machine_compatibility: this.getMachineCompatibility(item.product?.name),
        is_planned: Boolean(item.planned_machine_id),
        planned_machine_id: item.planned_machine_id,
        days_until_delivery: this.calculateDaysUntilDelivery(order.delivery_date)
      }))
    )

    // Converter máquinas com planejamento
    const machinesWithPlanning: MachineWithPlanning[] = machines.map(machine => {
      const machinePlanning = plannings.find(p => p.machine_id === machine.id)
      const plannedOrders = availableOrders.filter(o => o.planned_machine_id === machine.id)
      
      return {
        id: machine.id,
        machine_number: machine.machine_number,
        name: machine.name,
        type: this.mapMachineType(machine.type),
        status: this.mapMachineStatus(machine.status),
        currentProduct: machine.current_product,
        currentProgress: machine.machine_status?.[0]?.progress_percentage || 0,
        efficiency: machine.machine_status?.[0]?.efficiency_current || 0,
        weeklyPlanning: machinePlanning,
        plannedOrders: plannedOrders.map(this.mapToPlannedOrderItem),
        weeklyTarget: machinePlanning?.total_planned_quantity || 0,
        weeklyProgress: this.calculateWeeklyProgress(plannedOrders),
        capacity_per_hour: 375, // Capacidade padrão 375 unidades/hora
        utilization_percentage: this.calculateUtilization(plannedOrders, 375),
        on_schedule: this.isOnSchedule(plannedOrders),
        alerts: this.generateMachineAlerts(machine, plannedOrders)
      }
    })

    // Converter planejamentos
    const weeklyPlannings: WeeklyPlanningComplete[] = plannings.map(planning => ({
      ...planning,
      planned_orders: availableOrders
        .filter(o => o.planned_machine_id === planning.machine_id)
        .map(this.mapToPlannedOrderItem)
    }))

    // Calcular métricas
    const metrics = this.calculateWeekMetrics(machinesWithPlanning, weekStart)

    return {
      planning: weeklyPlannings,
      machines: machinesWithPlanning,
      availableOrders: availableOrders.filter(o => !o.is_planned),
      metrics
    }
  }

  // Mover pedido entre máquinas (drag-and-drop)
  async moveOrderBetweenMachines(
    orderItemId: string, 
    fromMachineId: string | null, 
    toMachineId: string
  ): Promise<{ success: boolean; error?: string }> {
    
    if (!this.isSupabaseAvailable()) {
      return { success: false, error: 'Supabase não disponível' }
    }

    try {
      console.log(`Movendo pedido ${orderItemId} para máquina ${toMachineId}`)

      // Atualizar order_item com nova máquina planejada
      const { error: updateError } = await supabase
        .from('order_items')
        .update({
          planned_machine_id: toMachineId,
          updated_at: new Date().toISOString()
        })
        .eq('id', orderItemId)

      if (updateError) {
        throw new Error(`Erro ao atualizar pedido: ${updateError.message}`)
      }

      // Recalcular totais do planejamento semanal
      await this.updateWeeklyPlanningTotals(toMachineId)
      if (fromMachineId) {
        await this.updateWeeklyPlanningTotals(fromMachineId)
      }

      console.log('Pedido movido com sucesso')
      return { success: true }

    } catch (error) {
      console.error('Erro ao mover pedido:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      }
    }
  }

  // Salvar planejamento e sincronizar com cards das máquinas
  async savePlanningAndSync(planningData: WeeklyPlanningUpdate): Promise<{
    success: boolean
    error?: string
  }> {
    if (!this.isSupabaseAvailable()) {
      return { success: false, error: 'Supabase não disponível' }
    }

    try {
      console.log('Salvando planejamento semanal:', planningData.week_start_date)

      // 1. Salvar/atualizar planejamentos por máquina
      for (const assignment of planningData.machineAssignments) {
        const { error: upsertError } = await supabase
          .from('weekly_planning')
          .upsert({
            machine_id: assignment.machine_id,
            week_start_date: planningData.week_start_date,
            week_end_date: this.calculateWeekEndDate(planningData.week_start_date),
            total_planned_quantity: assignment.production_goal,
            planned_orders: assignment.orders,
            notes: assignment.notes,
            status: 'active',
            updated_at: new Date().toISOString()
          })

        if (upsertError) {
          throw new Error(`Erro ao salvar planejamento: ${upsertError.message}`)
        }
      }

      // 2. Atualizar order_items com máquinas planejadas
      for (const assignment of planningData.machineAssignments) {
        for (const order of assignment.orders) {
          await supabase
            .from('order_items')
            .update({
              planned_machine_id: assignment.machine_id,
              planned_start_date: planningData.week_start_date,
              updated_at: new Date().toISOString()
            })
            .eq('id', order.order_id)
        }
      }

      console.log('Planejamento salvo e sincronizado com sucesso')
      return { success: true }

    } catch (error) {
      console.error('Erro ao salvar planejamento:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      }
    }
  }

  // Métodos utilitários privados
  private calculateEstimatedHours(quantity: number, productName?: string): number {
    // Lógica para estimar horas baseado no produto e quantidade
    const baseRate = 100 // unidades por hora (padrão)
    return Math.ceil(quantity / baseRate)
  }

  private getMachineCompatibility(productName?: string): string[] {
    // Retornar IDs das máquinas compatíveis com o produto
    // Implementar lógica baseada no tipo de produto
    return [] // Placeholder
  }

  private calculateDaysUntilDelivery(deliveryDate: string): number {
    const today = new Date()
    const delivery = new Date(deliveryDate)
    const diffTime = delivery.getTime() - today.getTime()
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  }

  private mapMachineType(type: string): 'no_print' | 'with_print' | 'special' {
    const typeMap: Record<string, 'no_print' | 'with_print' | 'special'> = {
      'sem_impressao': 'no_print',
      'com_impressao': 'with_print',
      'especial': 'special'
    }
    return typeMap[type] || 'no_print'
  }

  private mapMachineStatus(status: string): 'active' | 'stopped' | 'maintenance' | 'waiting' {
    const statusMap: Record<string, 'active' | 'stopped' | 'maintenance' | 'waiting'> = {
      'ativa': 'active',
      'manutencao': 'maintenance',
      'inativa': 'stopped'
    }
    return statusMap[status] || 'stopped'
  }

  private mapToPlannedOrderItem(order: OrderForPlanning): PlannedOrderItem {
    return {
      order_id: order.id,
      order_number: order.order_number,
      product_id: order.product_id,
      product_name: order.product_name,
      product_code: order.product_code,
      client_id: order.client_id,
      client_name: order.client_name,
      quantity: order.quantity,
      completed_quantity: 0, // TODO: buscar do banco
      priority: order.priority,
      delivery_date: order.delivery_date,
      estimated_duration_hours: order.estimated_hours,
      sequence_order: 1, // TODO: implementar sequenciamento
      status: 'planned',
      progress_percentage: 0
    }
  }

  private calculateWeeklyProgress(orders: OrderForPlanning[]): number {
    if (orders.length === 0) return 0
    const totalQuantity = orders.reduce((sum, o) => sum + o.quantity, 0)
    const completedQuantity = orders.reduce((sum, o) => sum + (o.quantity * 0), 0) // TODO: implementar
    return totalQuantity > 0 ? (completedQuantity / totalQuantity) * 100 : 0
  }

  private calculateUtilization(orders: OrderForPlanning[], capacityPerHour: number): number {
    const totalHours = orders.reduce((sum, o) => sum + o.estimated_hours, 0)
    const weeklyCapacity = capacityPerHour * 8 * 5 // 8h/dia * 5 dias
    return weeklyCapacity > 0 ? (totalHours / weeklyCapacity) * 100 : 0
  }

  private isOnSchedule(orders: OrderForPlanning[]): boolean {
    // Verificar se todos os pedidos estão dentro do cronograma
    return orders.every(o => o.days_until_delivery >= 0)
  }

  private generateMachineAlerts(machine: any, orders: OrderForPlanning[]): any[] {
    const alerts = []
    
    // Alerta de sobrecarga
    const utilization = this.calculateUtilization(orders, 375) // Capacidade padrão
    if (utilization > 100) {
      alerts.push({
        type: 'overload',
        message: `Máquina sobrecarregada: ${utilization.toFixed(0)}% da capacidade`,
        severity: 'high'
      })
    }

    // Alerta de pedidos urgentes
    const urgentOrders = orders.filter(o => o.priority === 'urgente' && o.days_until_delivery <= 3)
    if (urgentOrders.length > 0) {
      alerts.push({
        type: 'urgent_order',
        message: `${urgentOrders.length} pedido(s) urgente(s) com entrega próxima`,
        severity: 'critical'
      })
    }

    return alerts
  }

  private calculateWeekMetrics(machines: MachineWithPlanning[], weekStart: string): ProductionMetrics {
    // Implementar cálculo de métricas semanais
    return {
      week_start: weekStart,
      week_end: this.calculateWeekEndDate(weekStart),
      machines: machines.map(m => ({
        machine_id: m.id,
        planned_quantity: m.weeklyTarget,
        actual_quantity: 0, // TODO: implementar
        efficiency_planned: 85,
        efficiency_actual: m.efficiency,
        orders_completed: 0,
        orders_delayed: 0,
        utilization_hours: 0
      })),
      overall: {
        total_planned: machines.reduce((sum, m) => sum + m.weeklyTarget, 0),
        total_actual: 0,
        efficiency_average: 85,
        on_time_delivery_rate: 95,
        machine_utilization_average: 75
      }
    }
  }

  private calculateWeekEndDate(weekStart: string): string {
    const startDate = new Date(weekStart)
    const endDate = new Date(startDate)
    endDate.setDate(startDate.getDate() + 6)
    return endDate.toISOString().split('T')[0]
  }

  private async updateWeeklyPlanningTotals(machineId: string): Promise<void> {
    // Recalcular totais do planejamento quando pedidos são movidos
    const { data: orderItems } = await supabase
      .from('order_items')
      .select('quantity')
      .eq('planned_machine_id', machineId)

    const totalQuantity = orderItems?.reduce((sum, item) => sum + item.quantity, 0) || 0

    await supabase
      .from('weekly_planning')
      .update({ total_planned_quantity: totalQuantity })
      .eq('machine_id', machineId)
  }
}

export const integratedPlanningService = new IntegratedPlanningService()
export default integratedPlanningService
