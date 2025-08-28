// Modal de Cadastro de Operadores - Sistema Soropel
// Permite criar e editar operadores do sistema

import React, { useState, useEffect } from 'react'
import {
  X,
  User,
  Phone,
  Mail,
  CreditCard,
  Clock,
  Settings,
  Save,
  AlertCircle,
  CheckCircle,
  Loader2
} from 'lucide-react'
import { cn } from '@/utils'
import operatorsService from '@/services/operatorsService'
import type { Operator } from '@/types/supabase'

interface ModalCadastroOperadorProps {
  isOpen: boolean
  onClose: () => void
  operator?: Operator | null // Para edição
  onSuccess?: (operator: Operator) => void
}

interface FormData {
  name: string
  cpf: string
  phone: string
  email: string
  role: 'operador' | 'supervisor' | 'tecnico' | 'manutencao'
  shift: 'manha' | 'tarde' | 'noite' | 'integral'
  machine_ids: number[]
}

interface FormErrors {
  name?: string
  cpf?: string
  phone?: string
  email?: string
  role?: string
  shift?: string
  machine_ids?: string
}

const AVAILABLE_MACHINES = [
  { id: 1, name: 'Máquina 01 - Produção A' },
  { id: 2, name: 'Máquina 02 - Produção B' },
  { id: 3, name: 'Máquina 03 - Produção C' },
  { id: 4, name: 'Máquina 04 - Produção D' },
  { id: 5, name: 'Máquina 05 - Produção E' },
  { id: 6, name: 'Máquina 06 - Produção F' },
  { id: 7, name: 'Máquina 07 - Produção G' },
  { id: 8, name: 'Máquina 08 - Produção H' },
  { id: 9, name: 'Máquina 09 - Produção I' }
]

const ROLES = [
  { value: 'operador', label: 'Operador' },
  { value: 'supervisor', label: 'Supervisor' },
  { value: 'tecnico', label: 'Técnico' },
  { value: 'manutencao', label: 'Manutenção' }
] as const

const SHIFTS = [
  { value: 'manha', label: 'Manhã (06:00 - 14:00)' },
  { value: 'tarde', label: 'Tarde (14:00 - 22:00)' },
  { value: 'noite', label: 'Noite (22:00 - 06:00)' },
  { value: 'integral', label: 'Integral (Flexível)' }
] as const

export const ModalCadastroOperador: React.FC<ModalCadastroOperadorProps> = ({
  isOpen,
  onClose,
  operator,
  onSuccess
}) => {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    cpf: '',
    phone: '',
    email: '',
    role: 'operador',
    shift: 'manha',
    machine_ids: []
  })

  const [errors, setErrors] = useState<FormErrors>({})
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const isEditing = !!operator

  // Inicializar formulário com dados do operador (se editando)
  useEffect(() => {
    if (operator) {
      setFormData({
        name: operator.name,
        cpf: operator.cpf || '',
        phone: operator.phone || '',
        email: operator.email || '',
        role: operator.role,
        shift: operator.shift,
        machine_ids: operator.machine_ids || []
      })
    } else {
      // Reset form para novo operador
      setFormData({
        name: '',
        cpf: '',
        phone: '',
        email: '',
        role: 'operador',
        shift: 'manha',
        machine_ids: []
      })
    }
    setErrors({})
    setSuccess(false)
  }, [operator, isOpen])

  // Validação do formulário
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Nome é obrigatório'
    }

    if (formData.cpf && !/^\d{11}$/.test(formData.cpf.replace(/\D/g, ''))) {
      newErrors.cpf = 'CPF deve ter 11 dígitos'
    }

    if (formData.phone && !/^\(\d{2}\)\s\d{4,5}-\d{4}$/.test(formData.phone)) {
      newErrors.phone = 'Telefone deve estar no formato (11) 99999-9999'
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email deve ter um formato válido'
    }

    if (formData.machine_ids.length === 0) {
      newErrors.machine_ids = 'Selecione pelo menos uma máquina'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Formatação de CPF
  const formatCPF = (value: string) => {
    const numbers = value.replace(/\D/g, '')
    return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
  }

  // Formatação de telefone
  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, '')
    if (numbers.length <= 10) {
      return numbers.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3')
    }
    return numbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')
  }

  // Manipular mudanças no formulário
  const handleInputChange = (field: keyof FormData, value: string | number[]) => {
    let processedValue = value

    // Formatação específica por campo
    if (field === 'cpf' && typeof value === 'string') {
      processedValue = formatCPF(value)
    } else if (field === 'phone' && typeof value === 'string') {
      processedValue = formatPhone(value)
    }

    setFormData(prev => ({ ...prev, [field]: processedValue }))
    
    // Limpar erro do campo quando usuário começar a digitar
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  // Manipular seleção de máquinas
  const handleMachineToggle = (machineId: number) => {
    const newMachineIds = formData.machine_ids.includes(machineId)
      ? formData.machine_ids.filter(id => id !== machineId)
      : [...formData.machine_ids, machineId]
    
    handleInputChange('machine_ids', newMachineIds)
  }

  // Submeter formulário
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setLoading(true)
    
    try {
      let result: Operator
      
      if (isEditing && operator) {
        // Atualizar operador existente
        result = await operatorsService.updateOperator(operator.id, {
          name: formData.name,
          cpf: formData.cpf || undefined,
          phone: formData.phone || undefined,
          email: formData.email || undefined,
          role: formData.role,
          shift: formData.shift,
          machine_ids: formData.machine_ids
        })
      } else {
        // Criar novo operador
        result = await operatorsService.createOperator({
          name: formData.name,
          cpf: formData.cpf || undefined,
          phone: formData.phone || undefined,
          email: formData.email || undefined,
          role: formData.role,
          shift: formData.shift,
          machine_ids: formData.machine_ids
        })
      }

      setSuccess(true)
      
      // Chamar callback de sucesso
      if (onSuccess) {
        onSuccess(result)
      }

      // Fechar modal após 1.5 segundos
      setTimeout(() => {
        onClose()
        setSuccess(false)
      }, 1500)
      
    } catch (error) {
      console.error('Erro ao salvar operador:', error)
      setErrors({ name: 'Erro ao salvar operador. Tente novamente.' })
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <User className="w-6 h-6" />
              <h2 className="text-xl font-bold">
                {isEditing ? 'Editar Operador' : 'Cadastrar Operador'}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {success ? (
            // Mensagem de sucesso
            <div className="text-center py-8">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                {isEditing ? 'Operador atualizado!' : 'Operador cadastrado!'}
              </h3>
              <p className="text-gray-600">
                {isEditing ? 'As informações foram atualizadas com sucesso.' : 'O operador foi adicionado ao sistema.'}
              </p>
            </div>
          ) : (
            // Formulário
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Dados Pessoais */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <User className="w-5 h-5 text-blue-600" />
                  Dados Pessoais
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Nome */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nome Completo *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className={cn(
                        "w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent",
                        errors.name ? "border-red-500" : "border-gray-300"
                      )}
                      placeholder="Digite o nome completo"
                    />
                    {errors.name && (
                      <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        {errors.name}
                      </p>
                    )}
                  </div>

                  {/* CPF */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      CPF
                    </label>
                    <div className="relative">
                      <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        value={formData.cpf}
                        onChange={(e) => handleInputChange('cpf', e.target.value)}
                        className={cn(
                          "w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent",
                          errors.cpf ? "border-red-500" : "border-gray-300"
                        )}
                        placeholder="000.000.000-00"
                        maxLength={14}
                      />
                    </div>
                    {errors.cpf && (
                      <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        {errors.cpf}
                      </p>
                    )}
                  </div>

                  {/* Telefone */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Telefone
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        className={cn(
                          "w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent",
                          errors.phone ? "border-red-500" : "border-gray-300"
                        )}
                        placeholder="(11) 99999-9999"
                        maxLength={15}
                      />
                    </div>
                    {errors.phone && (
                      <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        {errors.phone}
                      </p>
                    )}
                  </div>

                  {/* Email */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        className={cn(
                          "w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent",
                          errors.email ? "border-red-500" : "border-gray-300"
                        )}
                        placeholder="operador@soropel.com"
                      />
                    </div>
                    {errors.email && (
                      <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        {errors.email}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Função e Turno */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <Settings className="w-5 h-5 text-blue-600" />
                  Função e Turno
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Função */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Função *
                    </label>
                    <select
                      value={formData.role}
                      onChange={(e) => handleInputChange('role', e.target.value as FormData['role'])}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      {ROLES.map(role => (
                        <option key={role.value} value={role.value}>
                          {role.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Turno */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Turno *
                    </label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <select
                        value={formData.shift}
                        onChange={(e) => handleInputChange('shift', e.target.value as FormData['shift'])}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        {SHIFTS.map(shift => (
                          <option key={shift.value} value={shift.value}>
                            {shift.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Máquinas */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <Settings className="w-5 h-5 text-blue-600" />
                  Máquinas que Pode Operar *
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {AVAILABLE_MACHINES.map(machine => (
                    <label
                      key={machine.id}
                      className={cn(
                        "flex items-center p-3 border rounded-lg cursor-pointer transition-colors",
                        formData.machine_ids.includes(machine.id)
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-300 hover:border-gray-400"
                      )}
                    >
                      <input
                        type="checkbox"
                        checked={formData.machine_ids.includes(machine.id)}
                        onChange={() => handleMachineToggle(machine.id)}
                        className="mr-3 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm font-medium text-gray-700">
                        {machine.name}
                      </span>
                    </label>
                  ))}
                </div>
                
                {errors.machine_ids && (
                  <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.machine_ids}
                  </p>
                )}
              </div>
            </form>
          )}
        </div>

        {/* Footer */}
        {!success && (
          <div className="p-6 border-t bg-gray-50 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className={cn(
                "px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2",
                loading && "opacity-50 cursor-not-allowed"
              )}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {isEditing ? 'Atualizando...' : 'Cadastrando...'}
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  {isEditing ? 'Atualizar' : 'Cadastrar'}
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default ModalCadastroOperador