// Modal Sistema IoT - Dashboard de Produção e Análise de Batidas
// Sistema Soropel - Contador de Sacos em Tempo Real

import React, { useState, useEffect } from 'react'
import { 
  X, 
  Wifi, 
  WifiOff, 
  Activity, 
  Target, 
  Clock, 
  TrendingUp,
  Settings,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Zap,
  BarChart3,
  Router
} from 'lucide-react'
import type { ModalIoTSystemProps, IoTDevice, IoTDashboardData } from '@/types/gestao-maquinas'

export const ModalIoTSystem: React.FC<ModalIoTSystemProps> = ({ 
  isOpen, 
  onClose 
}) => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'devices' | 'analytics'>('dashboard')
  const [loading, setLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false) // Para mostrar indicador discreto
  const [error, setError] = useState<string | null>(null)
  const [devices, setDevices] = useState<IoTDevice[]>([])
  const [dashboardData, setDashboardData] = useState<IoTDashboardData[]>([])

  // Estado para configuração de novo dispositivo
  const [showAddDevice, setShowAddDevice] = useState(false)
  const [newDevice, setNewDevice] = useState({
    device_id: '',
    name: '',
    machine_id: '',
    wifi_ssid: 'Soropel_IoT',
    sensor_pin: 34
  })

  // Carregar dados quando modal abrir
  useEffect(() => {
    if (isOpen) {
      loadIoTData(true) // Carregamento inicial com loading
      // Auto-refresh a cada 5 segundos para dados em tempo real (sem loading visual)
      const interval = setInterval(() => loadIoTData(false), 5000)
      return () => clearInterval(interval)
    }
  }, [isOpen])

  const loadIoTData = async (isInitialLoad = false) => {
    // Só mostrar loading no carregamento inicial, refreshing nos updates
    if (isInitialLoad) {
      setLoading(true)
    } else {
      setRefreshing(true)
    }
    setError(null)

    try {
      // Remover delay desnecessário nos refreshs
      if (isInitialLoad) {
        await new Promise(resolve => setTimeout(resolve, 500))
      }

      // Mock data com dados de produção realísticos
      const mockDevices: IoTDevice[] = [
        {
          id: '1',
          device_id: 'ESP32_001',
          name: 'Contador Máquina 1',
          type: 'ESP32_CONTADOR',
          machine_id: '1',
          ip_address: '192.168.1.101',
          last_seen: '2025-08-04T21:30:00Z',
          status: 'online',
          firmware_version: 'v1.0.0',
          config_settings: { sensor_pin: 34, wifi_ssid: 'Soropel_IoT' },
          active: true,
          created_at: '2025-08-01T10:00:00Z',
          updated_at: '2025-08-04T21:30:00Z'
        },
        {
          id: '2',
          device_id: 'ESP32_002',
          name: 'Contador Máquina 2',
          type: 'ESP32_CONTADOR',
          machine_id: '2',
          ip_address: '192.168.1.102',
          last_seen: '2025-08-04T21:25:00Z',
          status: 'offline',
          firmware_version: 'v1.0.0',
          config_settings: { sensor_pin: 34, wifi_ssid: 'Soropel_IoT' },
          active: true,
          created_at: '2025-08-01T10:00:00Z',
          updated_at: '2025-08-04T21:25:00Z'
        },
        {
          id: '3',
          device_id: 'ESP32_003',
          name: 'Contador Máquina 3',
          type: 'ESP32_CONTADOR',
          machine_id: '3',
          ip_address: '192.168.1.103',
          last_seen: '2025-08-04T21:31:00Z',
          status: 'online',
          firmware_version: 'v1.0.0',
          config_settings: { sensor_pin: 34, wifi_ssid: 'Soropel_IoT' },
          active: true,
          created_at: '2025-08-01T10:00:00Z',
          updated_at: '2025-08-04T21:31:00Z'
        }
      ]

      const mockDashboardData: IoTDashboardData[] = [
        {
          device: mockDevices[0],
          currentCount: 2156,
          dailyGoal: 2800,
          currentSpeed: 13.8,
          efficiency: 82,
          lastUpdate: '2025-08-04T21:30:00Z',
          isOnline: true
        },
        {
          device: mockDevices[1],
          currentCount: 0,
          dailyGoal: 2200,
          currentSpeed: 0,
          efficiency: 0,
          lastUpdate: '2025-08-04T21:25:00Z',
          isOnline: false
        },
        {
          device: mockDevices[2],
          currentCount: 2847,
          dailyGoal: 3500,
          currentSpeed: 15.2,
          efficiency: 89,
          lastUpdate: '2025-08-04T21:31:00Z',
          isOnline: true
        }
      ]

      setDevices(mockDevices)
      setDashboardData(mockDashboardData)
    } catch (error) {
      setError('Erro ao carregar dados IoT')
      console.error('Erro IoT:', error)
    } finally {
      // Resetar estados de loading apropriados
      if (isInitialLoad) {
        setLoading(false)
      } else {
        setRefreshing(false)
      }
    }
  }

  const handleAddDevice = async () => {
    if (!newDevice.device_id || !newDevice.name) {
      setError('Preencha todos os campos obrigatórios')
      return
    }

    setLoading(true)
    try {
      // Aqui enviaria para o Supabase
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setShowAddDevice(false)
      setNewDevice({
        device_id: '',
        name: '',
        machine_id: '',
        wifi_ssid: 'Soropel_IoT',
        sensor_pin: 34
      })
      
      loadIoTData(false) // Reload sem loading visual
    } catch (error) {
      setError('Erro ao adicionar dispositivo')
    } finally {
      setLoading(false)
    }
  }

  const formatLastSeen = (timestamp: string) => {
    const now = new Date()
    const lastSeen = new Date(timestamp)
    const diff = Math.floor((now.getTime() - lastSeen.getTime()) / 1000)
    
    if (diff < 60) return `${diff}s atrás`
    if (diff < 3600) return `${Math.floor(diff / 60)}min atrás`
    return `${Math.floor(diff / 3600)}h atrás`
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 bg-gradient-to-r from-purple-600 to-blue-600 text-white">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
              <Router className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Sistema IoT - Dashboard de Produção</h2>
              <div className="flex items-center space-x-2">
                <p className="text-purple-100">Análise de Batidas e Performance em Tempo Real</p>
                {refreshing && (
                  <div className="flex items-center space-x-1">
                    <RefreshCw className="w-3 h-3 animate-spin" />
                    <span className="text-xs text-purple-100">Atualizando...</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white hover:bg-opacity-20 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-6 py-3 font-medium transition-colors ${
              activeTab === 'dashboard'
                ? 'text-purple-600 border-b-2 border-purple-600 bg-purple-50'
                : 'text-gray-600 hover:text-purple-600'
            }`}
          >
            <div className="flex items-center space-x-2">
              <BarChart3 className="w-4 h-4" />
              <span>Dashboard</span>
            </div>
          </button>

          <button
            onClick={() => setActiveTab('devices')}
            className={`px-6 py-3 font-medium transition-colors ${
              activeTab === 'devices'
                ? 'text-purple-600 border-b-2 border-purple-600 bg-purple-50'
                : 'text-gray-600 hover:text-purple-600'
            }`}
          >
            <div className="flex items-center space-x-2">
              <Wifi className="w-4 h-4" />
              <span>Dispositivos</span>
            </div>
          </button>

          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-6 py-3 font-medium transition-colors ${
              activeTab === 'analytics'
                ? 'text-purple-600 border-b-2 border-purple-600 bg-purple-50'
                : 'text-gray-600 hover:text-purple-600'
            }`}
          >
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-4 h-4" />
              <span>Análise Avançada</span>
            </div>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {loading && (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="w-6 h-6 animate-spin text-purple-600 mr-2" />
              <span>Carregando dados...</span>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 p-4 rounded-lg mb-4">
              <div className="flex items-center">
                <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
                <span className="text-red-700">{error}</span>
              </div>
            </div>
          )}

          {/* Dashboard Tab */}
          {activeTab === 'dashboard' && !loading && (
            <div className="space-y-6">
              {/* Métricas Principais */}
              <div className="grid md:grid-cols-3 gap-6">
                {dashboardData.filter(d => d.isOnline).map((data, index) => (
                  <div key={index} className="bg-gradient-to-br from-white to-gray-50 rounded-xl border border-gray-200 p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-gray-800">{data.device.name}</h3>
                      <div className="flex items-center space-x-1">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-xs text-green-600">Online</span>
                      </div>
                    </div>

                    {/* Contagem Principal */}
                    <div className="text-center mb-4">
                      <div className="text-3xl font-bold text-blue-600">{data.currentCount.toLocaleString()}</div>
                      <div className="text-sm text-gray-600">Batidas hoje</div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${Math.min((data.currentCount / data.dailyGoal) * 100, 100)}%` }}
                        ></div>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        Meta: {data.dailyGoal.toLocaleString()} ({Math.round((data.currentCount / data.dailyGoal) * 100)}%)
                      </div>
                    </div>

                    {/* Métricas */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-green-50 p-3 rounded-lg text-center">
                        <div className="text-lg font-bold text-green-600">{data.currentSpeed}/min</div>
                        <div className="text-xs text-green-700">Velocidade atual</div>
                      </div>
                      <div className="bg-purple-50 p-3 rounded-lg text-center">
                        <div className="text-lg font-bold text-purple-600">{data.efficiency}%</div>
                        <div className="text-xs text-purple-700">Eficiência</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Ranking de Produtividade */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h4 className="font-semibold text-gray-800 mb-4 flex items-center space-x-2">
                  <Target className="w-5 h-5" />
                  <span>🏆 Ranking de Produtividade (Batidas/Minuto)</span>
                </h4>
                
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 p-4 rounded-lg border-l-4 border-yellow-500">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium text-gray-800">Máquina 3</span>
                      <span className="text-sm text-yellow-600 font-bold">🥇 1º</span>
                    </div>
                    <div className="text-2xl font-bold text-yellow-700">15.2/min</div>
                    <div className="text-sm text-gray-600">2.847 batidas hoje</div>
                    <div className="text-xs text-yellow-600 mt-1">Meta: 81% concluída</div>
                  </div>
                  
                  <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-4 rounded-lg border-l-4 border-gray-400">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium text-gray-800">Máquina 1</span>
                      <span className="text-sm text-gray-600 font-bold">🥈 2º</span>
                    </div>
                    <div className="text-2xl font-bold text-gray-700">13.8/min</div>
                    <div className="text-sm text-gray-600">2.156 batidas hoje</div>
                    <div className="text-xs text-gray-600 mt-1">Meta: 77% concluída</div>
                  </div>
                  
                  <div className="bg-gradient-to-r from-red-50 to-red-100 p-4 rounded-lg border-l-4 border-red-500">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium text-gray-800">Máquina 2</span>
                      <span className="text-sm text-red-600 font-bold">⏸️ Parada</span>
                    </div>
                    <div className="text-2xl font-bold text-red-700">0/min</div>
                    <div className="text-sm text-gray-600">0 batidas hoje</div>
                    <div className="text-xs text-red-600 mt-1">Parada há 35min</div>
                  </div>
                </div>
              </div>

              {/* Análise de Médias */}
              <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl border border-green-200 p-6">
                <h4 className="font-semibold text-gray-800 mb-4 flex items-center space-x-2">
                  <Activity className="w-5 h-5" />
                  <span>📊 Análise de Médias de Produção</span>
                </h4>

                <div className="grid md:grid-cols-4 gap-4">
                  <div className="bg-white p-4 rounded-lg border border-blue-200 text-center">
                    <div className="text-2xl font-bold text-blue-600">12.4</div>
                    <div className="text-sm text-gray-700">Média Geral</div>
                    <div className="text-xs text-blue-600">batidas/min</div>
                  </div>
                  
                  <div className="bg-white p-4 rounded-lg border border-green-200 text-center">
                    <div className="text-2xl font-bold text-green-600">738</div>
                    <div className="text-sm text-gray-700">Média/Hora</div>
                    <div className="text-xs text-green-600">batidas ativas</div>
                  </div>
                  
                  <div className="bg-white p-4 rounded-lg border border-purple-200 text-center">
                    <div className="text-2xl font-bold text-purple-600">5.003</div>
                    <div className="text-sm text-gray-700">Total Hoje</div>
                    <div className="text-xs text-purple-600">todas máquinas</div>
                  </div>
                  
                  <div className="bg-white p-4 rounded-lg border border-yellow-200 text-center">
                    <div className="text-2xl font-bold text-yellow-600">85%</div>
                    <div className="text-sm text-gray-700">Meta Atingida</div>
                    <div className="text-xs text-yellow-600">performance geral</div>
                  </div>
                </div>

                {/* Performance por Turno - Incluindo Turno Único */}
                <div className="mt-4 grid md:grid-cols-2 gap-4">
                  <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                    <h5 className="font-medium text-gray-700 mb-3 flex items-center">
                      ⚡ Performance por Turno
                    </h5>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600 font-medium">Único (07h-17h/18h):</span>
                        <span className="text-sm font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded">13.8/min</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white p-4 rounded-lg border border-gray-200">
                    <h5 className="font-medium text-gray-700 mb-2">🎯 Projeções</h5>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Previsão fim do dia:</span>
                        <span className="text-sm font-bold text-purple-600">6.245 batidas</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Velocidade necessária:</span>
                        <span className="text-sm font-bold text-orange-600">13.5/min</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Possibilidade de meta:</span>
                        <span className="text-sm font-bold text-green-600">87% provável</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Devices Tab */}
          {activeTab === 'devices' && !loading && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Dispositivos IoT Conectados</h3>
                <button
                  onClick={() => setShowAddDevice(true)}
                  className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                >
                  + Adicionar Dispositivo
                </button>
              </div>

              <div className="grid gap-4">
                {devices.map((device) => (
                  <div key={device.id} className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full ${
                          device.status === 'online' ? 'bg-green-500' : 
                          device.status === 'offline' ? 'bg-red-500' : 'bg-yellow-500'
                        }`}></div>
                        <div>
                          <h4 className="font-medium">{device.name}</h4>
                          <p className="text-sm text-gray-600">{device.device_id}</p>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="text-sm font-medium">
                          {device.status === 'online' ? (
                            <span className="text-green-600 flex items-center">
                              <Wifi className="w-4 h-4 mr-1" />
                              Online
                            </span>
                          ) : (
                            <span className="text-red-600 flex items-center">
                              <WifiOff className="w-4 h-4 mr-1" />
                              Offline
                            </span>
                          )}
                        </div>
                        {device.last_seen && (
                          <div className="text-xs text-gray-500">
                            {formatLastSeen(device.last_seen)}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                      <div>
                        <span className="text-gray-600">IP:</span>
                        <span className="ml-1 font-mono">{device.ip_address || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Firmware:</span>
                        <span className="ml-1">{device.firmware_version}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Tipo:</span>
                        <span className="ml-1">{device.type}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Status:</span>
                        <span className={`ml-1 ${device.active ? 'text-green-600' : 'text-red-600'}`}>
                          {device.active ? 'Ativo' : 'Inativo'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Analytics Tab */}
          {activeTab === 'analytics' && !loading && (
            <div className="space-y-6">
              {/* Histórico de Performance */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h4 className="font-semibold text-gray-800 mb-4 flex items-center space-x-2">
                  <TrendingUp className="w-5 h-5" />
                  <span>📈 Histórico de Performance (Últimos 7 dias)</span>
                </h4>
                
                <div className="grid md:grid-cols-7 gap-3">
                  <div className="text-center">
                    <div className="text-xs text-gray-500 mb-2">Segunda</div>
                    <div className="h-20 bg-gradient-to-t from-blue-200 to-blue-100 rounded-lg relative flex items-end">
                      <div className="w-full h-16 bg-blue-500 rounded-lg"></div>
                    </div>
                    <div className="text-sm font-bold text-blue-600 mt-2">12.5/min</div>
                    <div className="text-xs text-gray-500">2.450 batidas</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-gray-500 mb-2">Terça</div>
                    <div className="h-20 bg-gradient-to-t from-green-200 to-green-100 rounded-lg relative flex items-end">
                      <div className="w-full h-18 bg-green-500 rounded-lg"></div>
                    </div>
                    <div className="text-sm font-bold text-green-600 mt-2">14.2/min</div>
                    <div className="text-xs text-gray-500">2.680 batidas</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-gray-500 mb-2">Quarta</div>
                    <div className="h-20 bg-gradient-to-t from-yellow-200 to-yellow-100 rounded-lg relative flex items-end">
                      <div className="w-full h-12 bg-yellow-500 rounded-lg"></div>
                    </div>
                    <div className="text-sm font-bold text-yellow-600 mt-2">11.8/min</div>
                    <div className="text-xs text-gray-500">2.180 batidas</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-gray-500 mb-2">Quinta</div>
                    <div className="h-20 bg-gradient-to-t from-purple-200 to-purple-100 rounded-lg relative flex items-end">
                      <div className="w-full h-17 bg-purple-500 rounded-lg"></div>
                    </div>
                    <div className="text-sm font-bold text-purple-600 mt-2">13.9/min</div>
                    <div className="text-xs text-gray-500">2.590 batidas</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-gray-500 mb-2">Sexta</div>
                    <div className="h-20 bg-gradient-to-t from-green-200 to-green-100 rounded-lg relative flex items-end">
                      <div className="w-full h-20 bg-green-600 rounded-lg"></div>
                    </div>
                    <div className="text-sm font-bold text-green-700 mt-2">15.2/min</div>
                    <div className="text-xs text-gray-500">2.847 batidas</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-gray-500 mb-2">Sábado</div>
                    <div className="h-20 bg-gradient-to-t from-blue-200 to-blue-100 rounded-lg relative flex items-end">
                      <div className="w-full h-10 bg-blue-400 rounded-lg"></div>
                    </div>
                    <div className="text-sm font-bold text-blue-500 mt-2">9.5/min</div>
                    <div className="text-xs text-gray-500">1.520 batidas</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-gray-500 mb-2">Domingo</div>
                    <div className="h-20 bg-gradient-to-t from-gray-200 to-gray-100 rounded-lg relative flex items-end">
                      <div className="w-full h-2 bg-gray-400 rounded-lg"></div>
                    </div>
                    <div className="text-sm font-bold text-gray-500 mt-2">0.8/min</div>
                    <div className="text-xs text-gray-500">95 batidas</div>
                  </div>
                </div>
                
                <div className="mt-6 bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-lg">
                  <div className="grid md:grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-green-600">12.4</div>
                      <div className="text-sm text-gray-700">Média Semanal</div>
                      <div className="text-xs text-green-600">+8% vs semana anterior</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-blue-600">15.2</div>
                      <div className="text-sm text-gray-700">Melhor Performance</div>
                      <div className="text-xs text-blue-600">Sexta-feira</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-purple-600">14.362</div>
                      <div className="text-sm text-gray-700">Total Batidas</div>
                      <div className="text-xs text-purple-600">Esta semana</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Análise por Turnos */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h4 className="font-semibold text-gray-800 mb-4 flex items-center space-x-2">
                  <Clock className="w-5 h-5" />
                  <span>⏰ Análise Detalhada por Turnos</span>
                </h4>
                
                <div className="grid md:grid-cols-1 gap-6">
                  <div className="bg-gradient-to-br from-emerald-50 to-green-50 p-4 rounded-lg border border-emerald-200">
                    <h5 className="font-medium text-emerald-800 mb-3">⭐ Turno Único (07h-17h/18h)</h5>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Média/min:</span>
                        <span className="text-sm font-bold text-emerald-600">13.8</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Total batidas:</span>
                        <span className="text-sm font-bold">8.280</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Eficiência:</span>
                        <span className="text-sm font-bold text-green-600">88%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Paradas:</span>
                        <span className="text-sm font-bold text-yellow-600">3 (35min)</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">H. Extra:</span>
                        <span className="text-sm font-bold text-emerald-600">+1h (828 bat.)</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 bg-gradient-to-r from-gray-50 to-blue-50 p-4 rounded-lg">
                  <h5 className="font-medium text-gray-800 mb-3">💡 Insights Automáticos:</h5>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-1 text-sm">
                      <p>• <strong>Turno único:</strong> 88% eficiência com hora extra produtiva</p>
                      <p>• <strong>Performance consistente:</strong> Evita quedas de produtividade</p>
                      <p>• <strong>Paradas controladas:</strong> Apenas 3 paradas em 35min</p>
                    </div>
                    <div className="space-y-1 text-sm">
                      <p>• <strong>Vantagem operacional:</strong> Melhor controle de qualidade</p>
                      <p>• <strong>Flexibilidade:</strong> Hora extra quando necessário</p>
                      <p>• <strong>Eficiência:</strong> Redução de setup entre turnos</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Adicionar Dispositivo */}
        {showAddDevice && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
              <h3 className="text-lg font-semibold mb-4">Adicionar Novo Dispositivo</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ID do Dispositivo
                  </label>
                  <input
                    type="text"
                    value={newDevice.device_id}
                    onChange={(e) => setNewDevice({...newDevice, device_id: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="ESP32_004"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nome do Dispositivo
                  </label>
                  <input
                    type="text"
                    value={newDevice.name}
                    onChange={(e) => setNewDevice({...newDevice, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Contador Máquina 4"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ID da Máquina
                  </label>
                  <input
                    type="text"
                    value={newDevice.machine_id}
                    onChange={(e) => setNewDevice({...newDevice, machine_id: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="4"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      WiFi SSID
                    </label>
                    <input
                      type="text"
                      value={newDevice.wifi_ssid}
                      onChange={(e) => setNewDevice({...newDevice, wifi_ssid: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Sensor Pin
                    </label>
                    <input
                      type="number"
                      value={newDevice.sensor_pin}
                      onChange={(e) => setNewDevice({...newDevice, sensor_pin: parseInt(e.target.value)})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowAddDevice(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleAddDevice}
                  disabled={loading}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
                >
                  {loading ? 'Adicionando...' : 'Adicionar'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="border-t border-gray-200 p-4 bg-gray-50 flex justify-between items-center">
          <div className="text-sm text-gray-600">
            Sistema IoT ESP32 - Soropel Embalagens | Análise de Produção em Tempo Real
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-gray-600">
                {dashboardData.filter(d => d.isOnline).length} dispositivos online
              </span>
            </div>
            <div className="text-sm text-gray-600">
              Última atualização: {new Date().toLocaleTimeString()}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ModalIoTSystem