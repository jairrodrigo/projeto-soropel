import React, { useState, useEffect } from 'react'
import { X, Settings, Activity, Clock, Wrench, User, AlertTriangle } from 'lucide-react'

interface Machine {
  id: number
  name: string
  currentProduct: string
  production: string
  efficiency: number
  status: string
  statusColor: string
}

interface ModalConfiguracaoMaquinaProps {
  isOpen: boolean
  onClose: () => void
  machineId?: number
}

export const ModalConfiguracaoMaquina: React.FC<ModalConfiguracaoMaquinaProps> = ({
  isOpen,
  onClose,
  machineId = 1
}) => {
  const [machine, setMachine] = useState<Machine>({
    id: machineId,
    name: `Máquina ${machineId}`,
    currentProduct: 'SACO KRAFT 2KG',
    production: '2.85 mil / 3.5 mil',
    efficiency: 87,
    status: 'Ativa',
    statusColor: 'text-green-600'
  })

  const [configs, setConfigs] = useState({
    metaDiaria: 3500,
    produtoSelecionado: 'SACO KRAFT 2KG'
  })

  const [acoes, setAcoes] = useState({
    motivoManutencao: '',
    mostrarCampoMotivo: false
  })

  // Dados específicos por máquina
  const machineData: { [key: number]: Partial<Machine> } = {
    1: { currentProduct: 'SACO KRAFT 2KG', production: '2.85 mil / 3.5 mil', efficiency: 87, status: 'Ativa', statusColor: 'text-green-600' },
    2: { currentProduct: 'Em manutenção', production: '0 mil / 2.2 mil', efficiency: 0, status: 'Manutenção', statusColor: 'text-yellow-600' },
    3: { currentProduct: 'SACO KRAFT 1KG', production: '0.98 mil / 1.2 mil', efficiency: 78, status: 'Ativa', statusColor: 'text-green-600' },
    4: { currentProduct: 'Aguardando material', production: '0 mil / 1.5 mil', efficiency: 0, status: 'Parada', statusColor: 'text-red-600' },
    5: { currentProduct: 'PAPEL SEMI KRAFT', production: '1.29 mil / 3.0 mil', efficiency: 92, status: 'Ativa', statusColor: 'text-green-600' },
    6: { currentProduct: 'Aguardando setup', production: '0 mil / 2.8 mil', efficiency: 0, status: 'Aguardando', statusColor: 'text-gray-600' },
    7: { currentProduct: 'KRAFT REVISTA', production: '4.23 mil / 4.5 mil', efficiency: 95, status: 'Ativa', statusColor: 'text-green-600' },
    8: { currentProduct: 'Produção finalizada', production: '0 mil / 1.8 mil', efficiency: 0, status: 'Parada', statusColor: 'text-red-600' },
    9: { currentProduct: 'TOALHA AMERICANA', production: '1.52 mil / 2.0 mil', efficiency: 89, status: 'Ativa', statusColor: 'text-green-600' }
  }

  const produtos = [
    'SACO KRAFT 2KG',
    'SACO KRAFT 1KG', 
    'PIPOCA 1-4',
    'KRAFT 1/2',
    'BRANCO 2KG',
    'SEMI KRAFT',
    'TIMBRADO 3KG',
    'ENVELOPE PIZZA',
    'TOALHA AMERICANA'
  ]

  useEffect(() => {
    if (machineId && machineData[machineId]) {
      setMachine(prev => ({
        ...prev,
        id: machineId,
        name: `Máquina ${machineId}`,
        ...machineData[machineId]
      }))
    }
  }, [machineId])

  const handlePararManutencao = () => {
    const motivo = acoes.motivoManutencao.trim() || 'Motivo não informado'
    console.log(`🔧 Parando ${machine.name} para manutenção: ${motivo}`)
    setTimeout(() => {
      onClose()
      console.log(`✅ ${machine.name} parada para manutenção!`)
    }, 1000)
  }

  const handlePararSemOperador = () => {
    console.log(`👤 Parando ${machine.name} - Sem operador`)
    setTimeout(() => {
      onClose()
      console.log(`✅ ${machine.name} parada - Sem operador!`)
    }, 1000)
  }

  const handleSalvar = () => {
    console.log(`💾 Salvando configurações da ${machine.name}...`)
    // TODO: Implementar salvamento no Supabase
    setTimeout(() => {
      onClose()
      console.log(`✅ Configurações da ${machine.name} salvas!`)
    }, 1500)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b-2 border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center">
            <Settings className="w-6 h-6 mr-2 text-blue-600" />
            Configurar {machine.name}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Status Atual */}
          <div className="p-4 bg-gray-50 rounded-xl">
            <h3 className="font-semibold text-lg mb-3 flex items-center">
              <Activity className="w-5 h-5 mr-2 text-blue-600" />
              Status Atual
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-sm text-gray-600">Produto:</span>
                <div className="font-medium text-gray-800">{machine.currentProduct}</div>
              </div>
              <div>
                <span className="text-sm text-gray-600">Produção:</span>
                <div className="font-medium text-gray-800">{machine.production}</div>
              </div>
              <div>
                <span className="text-sm text-gray-600">Eficiência:</span>
                <div className="font-medium text-gray-800">{machine.efficiency}%</div>
              </div>
              <div>
                <span className="text-sm text-gray-600">Status:</span>
                <div className={`font-medium ${machine.statusColor}`}>{machine.status}</div>
              </div>
            </div>
          </div>

          {/* Configurações */}
          <div className="p-4 bg-blue-50 rounded-xl">
            <h3 className="font-semibold text-lg mb-3 flex items-center">
              <Settings className="w-5 h-5 mr-2 text-blue-600" />
              Configurações
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Meta Diária (unidades)
                </label>
                <input
                  type="number"
                  value={configs.metaDiaria}
                  onChange={(e) => setConfigs(prev => ({ 
                    ...prev, 
                    metaDiaria: parseInt(e.target.value) || 0 
                  }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Produto Atual
                </label>
                <select
                  value={configs.produtoSelecionado}
                  onChange={(e) => setConfigs(prev => ({ 
                    ...prev, 
                    produtoSelecionado: e.target.value 
                  }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {produtos.map((produto) => (
                    <option key={produto} value={produto}>
                      {produto}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Ações Operacionais */}
          <div className="p-4 bg-orange-50 rounded-xl">
            <h3 className="font-semibold text-lg mb-3 flex items-center">
              <AlertTriangle className="w-5 h-5 mr-2 text-orange-600" />
              Ações Operacionais
            </h3>
            
            <div className="space-y-3">
              {/* Parar para Manutenção */}
              <div className="p-3 bg-white rounded-lg border">
                {!acoes.mostrarCampoMotivo && (
                  <div className="space-y-2">
                    <button
                      onClick={handlePararManutencao}
                      className="w-full bg-yellow-500 hover:bg-yellow-600 text-white py-2 rounded-lg font-medium text-sm flex items-center justify-center"
                    >
                      <Wrench className="w-4 h-4 mr-2" />
                      Parar para Manutenção
                    </button>
                    <button
                      onClick={() => setAcoes(prev => ({ 
                        ...prev, 
                        mostrarCampoMotivo: true 
                      }))}
                      className="w-full text-sm text-blue-600 hover:text-blue-700 py-1"
                    >
                      + Adicionar Motivo (Opcional)
                    </button>
                  </div>
                )}
                
                {acoes.mostrarCampoMotivo && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-medium text-gray-700 flex items-center">
                        <Wrench className="w-4 h-4 mr-2 text-yellow-600" />
                        Motivo da Manutenção
                      </label>
                      <button
                        onClick={() => setAcoes(prev => ({ 
                          ...prev, 
                          mostrarCampoMotivo: false,
                          motivoManutencao: '' 
                        }))}
                        className="text-sm text-gray-600 hover:text-gray-700"
                      >
                        Cancelar
                      </button>
                    </div>
                    <textarea
                      value={acoes.motivoManutencao}
                      onChange={(e) => setAcoes(prev => ({ 
                        ...prev, 
                        motivoManutencao: e.target.value 
                      }))}
                      placeholder="Motivo da manutenção (opcional - ex: problema na esteira, ajuste, troca de peça...)"
                      className="w-full p-2 border border-gray-300 rounded-lg text-sm resize-none"
                      rows={3}
                    />
                    <button
                      onClick={handlePararManutencao}
                      className="w-full bg-yellow-500 hover:bg-yellow-600 text-white py-2 rounded-lg font-medium text-sm flex items-center justify-center"
                    >
                      <Wrench className="w-4 h-4 mr-2" />
                      Parar para Manutenção
                    </button>
                  </div>
                )}
              </div>

              {/* Parar Sem Operador */}
              <div className="p-3 bg-white rounded-lg border">
                <button
                  onClick={handlePararSemOperador}
                  className="w-full bg-gray-500 hover:bg-gray-600 text-white py-2 rounded-lg font-medium text-sm flex items-center justify-center"
                >
                  <User className="w-4 h-4 mr-2" />
                  Parar - Sem Operador
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
          <button
            onClick={handleSalvar}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
          >
            Salvar Configurações
          </button>
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  )
}
