import React, { useEffect } from 'react'
import { 
  ClipboardList, 
  Package, 
  Settings, 
  Archive,
  Camera,
  Image,
  BarChart,
  Wrench,
  Package2,
  Truck
} from 'lucide-react'
import { MetricCard, AlertPanel, MachineGrid } from '@/components/dashboard'
import { Button, Card, CardContent, CardHeader, CardTitle } from '@/components/ui'
import { useDashboardStore, useUIStore } from '@/stores'
import { formatNumber, getTimeAgo } from '@/utils'

export const DashboardPage: React.FC = () => {
  const { 
    metrics, 
    production, 
    machines, 
    alerts, 
    activities, 
    isLoading, 
    connectionStatus, 
    refreshData, 
    testConnection 
  } = useDashboardStore()
  const { showNotification } = useUIStore()

  // 🔄 Carregar dados reais ao montar componente
  useEffect(() => {
    const loadDashboardData = async () => {
      // ✅ Dashboard carregando - log removido para console limpo
      
      // Testar conexão primeiro
      const connected = await testConnection()
      if (connected) {
        await refreshData()
        // ✅ Dashboard conectado - feedback visual já disponível na interface
      } else {
        showNotification({ 
          message: '⚠️ Problema na conexão com banco de dados', 
          type: 'warning' 
        })
      }
    }

    loadDashboardData()
  }, [refreshData, testConnection, showNotification])

  // Mock quick actions
  const quickActions = [
    {
      id: 'nova-bobina',
      label: 'Registrar',
      description: 'Nova Bobina',
      icon: Camera,
      color: 'bg-blue-600 hover:bg-blue-700',
      action: () => showNotification({ message: ' Abrindo Nova Bobina...', type: 'info' })
    },
    {
      id: 'novo-pedido',
      label: 'Novo Pedido',
      description: 'via Imagem', 
      icon: Image,
      color: 'bg-green-600 hover:bg-green-700',
      action: () => showNotification({ message: '📋 Abrindo Novo Pedido...', type: 'info' })
    },
    {
      id: 'relatorio',
      label: 'Relatório',
      description: 'Diário',
      icon: BarChart,
      color: 'bg-purple-600 hover:bg-purple-700',
      action: () => {
        // 📊 Gerando relatório - feedback visual substitui notificação
      }
    },
    {
      id: 'manutencao',
      label: 'Manutenção',
      description: 'Máquinas',
      icon: Wrench,
      color: 'bg-orange-600 hover:bg-orange-700',
      action: () => showNotification({ message: '🔧 Abrindo manutenção...', type: 'info' })
    },
    {
      id: 'estoque',
      label: 'Controle',
      description: 'Estoque',
      icon: Package2,
      color: 'bg-teal-600 hover:bg-teal-700',
      action: () => showNotification({ message: '📦 Abrindo estoque...', type: 'info' })
    },
    {
      id: 'entregas',
      label: 'Entregas',
      description: 'Hoje',
      icon: Truck,
      color: 'bg-indigo-600 hover:bg-indigo-700',
      action: () => showNotification({ message: '🚚 Verificando entregas...', type: 'info' })
    }
  ]

  return (
    <div className="space-y-8">
      {/* Title Section */}
      <div className="text-center">
        <h2 className="text-4xl font-bold text-gray-800 mb-3">📊 Dashboard Soropel</h2>
        <p className="text-gray-600 text-lg">Visão geral da produção em tempo real</p>
      </div>

      {/* Status Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-500">
            <span className={`${
              connectionStatus === 'connected' ? 'text-green-600' : 
              connectionStatus === 'error' ? 'text-red-600' : 'text-yellow-600'
            }`}>●</span> 
            {connectionStatus === 'connected' ? 'Online' : 
             connectionStatus === 'error' ? 'Offline' : 'Conectando...'}
            {connectionStatus === 'connected' && ' • Última atualização: há 2 seg'}
          </div>
        </div>
        <button
          onClick={refreshData}
          disabled={isLoading}
          className="text-sm text-blue-600 hover:text-blue-800 disabled:opacity-50"
        >
          {isLoading ? '🔄 Atualizando...' : '🔄 Atualizar dados'}
        </button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Pedidos em Andamento"
          value={metrics.pedidosAndamento}
          icon={ClipboardList}
          colorScheme="blue"
          progress={{
            current: 75,
            total: 100,
            label: '75% concluído'
          }}
        />

        <MetricCard
          title="Bobinas em Uso"
          value={metrics.bobinaemUso}
          icon={Package}
          colorScheme="green"
          subtitle="de 55 disponíveis"
        />

        <MetricCard
          title="Máquinas Ativas"
          value={`${metrics.maquinasAtivas.ativas}/${metrics.maquinasAtivas.total}`}
          icon={Settings}
          colorScheme="purple"
          subtitle={`${metrics.maquinasAtivas.eficienciaMedia}% eficiência média`}
        />

        <MetricCard
          title="Sobras Hoje"
          value={metrics.sobrasHoje}
          icon={Archive}
          colorScheme="orange"
          subtitle="3 bobinas aproveitáveis"
        />
      </div>

      {/* Production and Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Production Today */}
        <Card>
          <CardHeader>
            <CardTitle>Produção Hoje</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Meta Diária</span>
              <span className="font-bold text-gray-800">
                {formatNumber(production.metaDiaria)} mil
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Realizado</span>
              <span className="font-bold text-blue-600">
                {formatNumber(production.realizado)} mil
              </span>
            </div>
            
            {/* Progress Bar */}
            <div className="w-full bg-gray-200 rounded-full h-4">
              <div 
                className="bg-blue-600 h-4 rounded-full transition-all duration-500"
                style={{ width: `${production.porcentagem}%` }}
              />
            </div>
            <div className="text-sm text-gray-500">
              {production.porcentagem}% da meta • Projeção: {formatNumber(production.projecao)} mil às 22:00
            </div>
            
            {/* Top Products */}
            <div className="pt-4 border-t">
              <h4 className="font-medium mb-2">Top 3 Produtos</h4>
              <div className="space-y-2 text-sm">
                {production.topProdutos.map((produto, index) => (
                  <div key={index} className="flex justify-between">
                    <span>{produto.nome}</span>
                    <span className="font-medium">{formatNumber(produto.quantidade)} mil</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Ações Rápidas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {quickActions.map((action) => {
                const Icon = action.icon
                return (
                  <Button
                    key={action.id}
                    onClick={action.action}
                    className={`${action.color} text-white p-6 h-auto flex-col space-y-2 hover:scale-105 transition-all duration-300 shadow-md`}
                  >
                    <Icon className="w-8 h-8" />
                    <div className="text-sm font-medium">{action.label}</div>
                    <div className="text-xs opacity-90">{action.description}</div>
                  </Button>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alerts Panel */}
      <AlertPanel 
        alerts={alerts}
        onDismiss={(id) => showNotification({ 
          message: '✅ Alerta removido', 
          type: 'success' 
        })}
      />

      {/* Machine Grid */}
      <MachineGrid machines={machines} />

      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-20 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 flex items-center space-x-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span>Carregando dados...</span>
          </div>
        </div>
      )}
    </div>
  )
}
