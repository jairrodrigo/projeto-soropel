import React from 'react'
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export const DashboardPage: React.FC = () => {
  // Dados mockados para garantir funcionamento
  const metrics = {
    pedidosAndamento: 12,
    bobinaemUso: 8,
    maquinasAtivas: { ativas: 6, total: 9, eficienciaMedia: 87 },
    sobrasHoje: 23
  }

  const production = {
    metaDiaria: 450,
    realizado: 340,
    porcentagem: 76,
    projecao: 425,
    topProdutos: [
      { nome: 'Caixa Pequena', quantidade: 120 },
      { nome: 'Caixa Média', quantidade: 95 },
      { nome: 'Caixa Grande', quantidade: 67 }
    ]
  }

  const quickActions = [
    {
      id: 'nova-bobina',
      label: 'Registrar',
      description: 'Nova Bobina',
      icon: Camera,
      color: 'bg-blue-600 hover:bg-blue-700',
      path: '/nova-bobina'
    },
    {
      id: 'novo-pedido',
      label: 'Novo Pedido',
      description: 'via Imagem',
      icon: Image,
      color: 'bg-green-600 hover:bg-green-700',
      path: '/novo-pedido'
    },
    {
      id: 'relatorio',
      label: 'Relatório',
      description: 'Diário',
      icon: BarChart,
      color: 'bg-purple-600 hover:bg-purple-700',
      path: '/relatorio'
    },
    {
      id: 'manutencao',
      label: 'Manutenção',
      description: 'Máquinas',
      icon: Wrench,
      color: 'bg-orange-600 hover:bg-orange-700',
      path: '/manutencao'
    },
    {
      id: 'estoque',
      label: 'Controle',
      description: 'Estoque',
      icon: Package2,
      color: 'bg-teal-600 hover:bg-teal-700',
      path: '/estoque'
    },
    {
      id: 'entregas',
      label: 'Entregas',
      description: 'Hoje',
      icon: Truck,
      color: 'bg-indigo-600 hover:bg-indigo-700',
      path: '/entregas'
    }
  ]

  return (
    <div className="space-y-8 p-6">
      {/* Title Section */}
      <div className="text-center">
        <h2 className="text-4xl font-bold text-gray-800 mb-3">📊 Dashboard Soropel</h2>
        <p className="text-gray-600 text-lg">Visão geral da produção em tempo real</p>
      </div>

      {/* Status Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-500">
            <span className="text-green-600">●</span> Online • Última atualização: há 2 seg
          </div>
        </div>
        <button className="text-sm text-blue-600 hover:text-blue-800">
          🔄 Atualizar dados
        </button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pedidos em Andamento</CardTitle>
            <ClipboardList className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{metrics.pedidosAndamento}</div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div className="bg-blue-600 h-2 rounded-full" style={{ width: '75%' }} />
            </div>
            <p className="text-xs text-gray-500 mt-1">75% concluído</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bobinas em Uso</CardTitle>
            <Package className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{metrics.bobinaemUso}</div>
            <p className="text-xs text-gray-500">de 55 disponíveis</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Máquinas Ativas</CardTitle>
            <Settings className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {metrics.maquinasAtivas.ativas}/{metrics.maquinasAtivas.total}
            </div>
            <p className="text-xs text-gray-500">{metrics.maquinasAtivas.eficienciaMedia}% eficiência média</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sobras Hoje</CardTitle>
            <Archive className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{metrics.sobrasHoje}</div>
            <p className="text-xs text-gray-500">3 bobinas aproveitáveis</p>
          </CardContent>
        </Card>
      </div>

      {/* Production and Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Production Today */}
        <Card>
          <CardHeader>
            <CardTitle>Produção Hoje</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Meta Diária</span>
              <span className="font-bold text-gray-800">{production.metaDiaria} mil</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Realizado</span>
              <span className="font-bold text-blue-600">{production.realizado} mil</span>
            </div>
            
            {/* Progress Bar */}
            <div className="w-full bg-gray-200 rounded-full h-4">
              <div 
                className="bg-blue-600 h-4 rounded-full transition-all duration-500"
                style={{ width: `${production.porcentagem}%` }}
              />
            </div>
            <div className="text-sm text-gray-500">
              {production.porcentagem}% da meta • Projeção: {production.projecao} mil às 22:00
            </div>
            
            {/* Top Products */}
            <div className="pt-4 border-t">
              <h4 className="font-medium mb-2">Top 3 Produtos</h4>
              <div className="space-y-2 text-sm">
                {production.topProdutos.map((produto, index) => (
                  <div key={index} className="flex justify-between">
                    <span>{produto.nome}</span>
                    <span className="font-medium">{produto.quantidade} mil</span>
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
                    className={`${action.color} text-white p-6 h-auto flex flex-col space-y-2 hover:scale-105 transition-all duration-300`}
                    onClick={() => {
                      if (action.path === '/nova-bobina') {
                        window.location.href = action.path
                      } else {
                        alert(`Navegando para ${action.label}`)
                      }
                    }}
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

      {/* Simple Machine Status */}
      <Card>
        <CardHeader>
          <CardTitle>Status das Máquinas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Array.from({ length: 6 }, (_, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <div className="font-medium">Máquina {i + 1}</div>
                  <div className="text-sm text-gray-500">
                    {i < 5 ? '🟢 Ativa' : '🟡 Manutenção'}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium">
                    {i < 5 ? '87%' : '0%'}
                  </div>
                  <div className="text-xs text-gray-500">eficiência</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
