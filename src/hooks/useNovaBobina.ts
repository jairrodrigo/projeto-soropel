import { useState, useCallback, useRef } from 'react'
import { useUIStore } from '@/stores'
import type { 
  BobinaFormData, 
  BobinaStatus, 
  ProcessedBobinaData, 
  CameraState, 
  FormState
} from '@/types/nova-bobina'
import { TIPOS_PAPEL, FORNECEDORES, GRAMATURAS } from '@/types/nova-bobina'

export const useNovaBobina = () => {
  const { showNotification } = useUIStore()
  
  // Estados principais
  const [formData, setFormData] = useState<BobinaFormData>({
    codigoBobina: '',
    dataEntrada: new Date().toISOString().split('T')[0],
    tipoPapel: '',
    gramatura: '',
    fornecedor: '',
    pesoInicial: 0,
    pesoAtual: 0,
    status: 'estoque',
    observacoes: ''
  })

  const [cameraState, setCameraState] = useState<CameraState>({
    isActive: false,
    isReady: true,
    hasImage: false
  })

  const [formState, setFormState] = useState<FormState>({
    isProcessing: false,
    hasExtractedData: false,
    currentStep: 1
  })

  const [processedData, setProcessedData] = useState<ProcessedBobinaData | null>(null)
  
  // Refs para elementos do DOM
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Funções para gerenciar formulário
  const updateFormData = useCallback((updates: Partial<BobinaFormData>) => {
    setFormData(prev => {
      const newData = { ...prev, ...updates }
      
      // Auto-sync peso atual com peso inicial para status estoque
      if (updates.status === 'estoque' || (prev.status === 'estoque' && updates.pesoInicial !== undefined)) {
        newData.pesoAtual = newData.pesoInicial
      }
      
      return newData
    })
  }, [])

  const updateStatus = useCallback((status: BobinaStatus) => {
    updateFormData({ status })
    
    const statusMessages = {
      estoque: '📦 Status: ESTOQUE selecionado',
      'em-maquina': '⚙️ Status: EM MÁQUINA selecionado', 
      sobra: '📏 Status: SOBRA selecionado',
      acabou: '✅ Status: ACABOU selecionado'
    }
    
    showNotification({
      message: statusMessages[status],
      type: 'info'
    })
  }, [updateFormData, showNotification])

  // Funções de câmera
  const activateCamera = useCallback(async () => {
    try {
      setCameraState(prev => ({ ...prev, isActive: true }))
      
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      })
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
      }
      
      showNotification({
        message: '📹 Câmera ativada com sucesso',
        type: 'success'
      })
      
    } catch (error) {
      console.error('Erro ao ativar câmera:', error)
      setCameraState(prev => ({ ...prev, isActive: false }))
      showNotification({
        message: '❌ Erro ao ativar câmera. Verifique as permissões.',
        type: 'error'
      })
    }
  }, [showNotification])

  const captureImage = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current) return
    
    const canvas = canvasRef.current
    const video = videoRef.current
    const context = canvas.getContext('2d')
    
    if (!context) return
    
    // Configurar canvas com as dimensões do vídeo
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    
    // Capturar frame do vídeo
    context.drawImage(video, 0, 0)
    
    // Converter para blob
    canvas.toBlob(async (blob) => {
      if (blob) {
        setCameraState(prev => ({ ...prev, hasImage: true }))
        updateStep(2)
        await processImage(blob)
      }
    }, 'image/jpeg', 0.8)
    
    showNotification({
      message: '📸 Imagem capturada! Iniciando processamento...',
      type: 'success'
    })
  }, [])
  // Função de processamento de imagem (simulada)
  const processImage = useCallback(async (imageBlob: Blob) => {
    setFormState(prev => ({ ...prev, isProcessing: true }))
    
    // Simular processamento OCR com progresso
    const steps = [
      'Detectando texto no rótulo...',
      'Extraindo código da bobina...',
      'Identificando gramatura e largura...',
      'Reconhecendo fornecedor...',
      'Validando dados extraídos...',
      'Finalizando processamento...'
    ]
    
    for (let i = 0; i < steps.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 500))
      showNotification({
        message: steps[i],
        type: 'info'
      })
    }
    
    // Simular dados extraídos realistas
    const mockData: ProcessedBobinaData = {
      codigo: `BOB-2025-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
      tipoPapel: TIPOS_PAPEL[Math.floor(Math.random() * TIPOS_PAPEL.length)],
      gramatura: GRAMATURAS[Math.floor(Math.random() * GRAMATURAS.length)],
      fornecedor: FORNECEDORES[Math.floor(Math.random() * FORNECEDORES.length)],
      pesoInicial: Math.floor(Math.random() * 200) + 100 // 100-300kg
    }
    
    setProcessedData(mockData)
    
    // Preencher formulário com dados extraídos
    updateFormData({
      codigoBobina: mockData.codigo,
      tipoPapel: mockData.tipoPapel,
      gramatura: mockData.gramatura,
      fornecedor: mockData.fornecedor,
      pesoInicial: mockData.pesoInicial,
      pesoAtual: mockData.pesoInicial // Inicialmente igual
    })
    
    setFormState(prev => ({ 
      ...prev, 
      isProcessing: false, 
      hasExtractedData: true,
      currentStep: 3
    }))
    
    showNotification({
      message: '✅ Dados extraídos com sucesso!',
      type: 'success'
    })
  }, [updateFormData, showNotification])

  // Função para upload de imagem
  const uploadImage = useCallback(() => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        setCameraState(prev => ({ ...prev, hasImage: true }))
        updateStep(2)
        await processImage(file)
      }
    }
    
    input.click()
  }, [processImage])

  // Função para atualizar step
  const updateStep = useCallback((step: number) => {
    setFormState(prev => ({ ...prev, currentStep: step }))
  }, [])

  // Função para salvar bobina
  const saveBobina = useCallback(async () => {
    if (!formData.codigoBobina) {
      showNotification({
        message: '❌ Capture uma imagem primeiro!',
        type: 'error'
      })
      return false
    }
    
    try {
      // Simular salvamento
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      showNotification({
        message: `✅ Bobina salva com sucesso! ID: ${formData.codigoBobina}`,
        type: 'success'
      })
      
      return true
    } catch (error) {
      showNotification({
        message: '❌ Erro ao salvar bobina. Tente novamente.',
        type: 'error'
      })
      return false
    }
  }, [formData.codigoBobina, showNotification])

  // Função para limpar formulário
  const clearForm = useCallback(() => {
    setFormData({
      codigoBobina: '',
      dataEntrada: new Date().toISOString().split('T')[0],
      tipoPapel: '',
      gramatura: '',
      fornecedor: '',
      pesoInicial: 0,
      pesoAtual: 0,
      status: 'estoque',
      observacoes: ''
    })
    
    setCameraState({
      isActive: false,
      isReady: true,
      hasImage: false
    })
    
    setFormState({
      isProcessing: false,
      hasExtractedData: false,
      currentStep: 1
    })
    
    setProcessedData(null)
    
    // Parar stream da câmera se ativo
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream
      stream.getTracks().forEach(track => track.stop())
      videoRef.current.srcObject = null
    }
    
    showNotification({
      message: '🔄 Formulário limpo com sucesso',
      type: 'info'
    })
  }, [showNotification])

  // Função para retornar sobra ao estoque
  const returnToStock = useCallback((pesoSobra: number) => {
    if (!pesoSobra || !formData.codigoBobina) {
      showNotification({
        message: '❌ Dados insuficientes para retorno ao estoque',
        type: 'error'
      })
      return
    }
    
    updateFormData({
      status: 'estoque',
      pesoInicial: pesoSobra,
      pesoAtual: pesoSobra,
      observacoes: `Bobina retornada ao estoque como sobra aproveitável. Peso original: ${pesoSobra}kg. Data de retorno: ${new Date().toLocaleDateString('pt-BR')}.`
    })
    
    showNotification({
      message: `✅ Sobra de ${pesoSobra}kg retornada ao estoque com sucesso!`,
      type: 'success'
    })
  }, [formData.codigoBobina, updateFormData, showNotification])

  return {
    // Estados
    formData,
    cameraState,
    formState,
    processedData,
    
    // Refs
    videoRef,
    canvasRef,
    
    // Funções
    updateFormData,
    updateStatus,
    activateCamera,
    captureImage,
    uploadImage,
    updateStep,
    saveBobina,
    clearForm,
    returnToStock
  }
}
