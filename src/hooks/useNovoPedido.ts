import { useState, useCallback, useRef } from 'react';
import { useUIStore } from '@/stores';
import type { 
  PedidoFormData, 
  ProcessedPedidoData, 
  CameraState, 
  FormState
} from '@/types/novo-pedido';
import { MAQUINAS_DISPONIVEIS } from '@/types/novo-pedido';

export const useNovoPedido = () => {
  const { showNotification } = useUIStore();
  
  // Estados principais
  const [formData, setFormData] = useState<PedidoFormData>({
    numeroOrdem: '',
    dataEntrega: new Date().toISOString().split('T')[0],
    prioridade: 'media',
    tipo: 'neutro',
    cliente: {
      razaoSocial: '',
      nomeFantasia: '',
      cnpj: '',
      endereco: '',
      cep: '',
      telefone: '',
      email: ''
    },
    produtos: [],
    observacoes: ''
  });

  const [cameraState, setCameraState] = useState<CameraState>({
    isActive: false,
    isReady: true,
    hasImage: false
  });

  const [formState, setFormState] = useState<FormState>({
    isProcessing: false,
    hasExtractedData: false,
    currentStep: 1
  });

  const [processedData, setProcessedData] = useState<ProcessedPedidoData | null>(null);
  
  // Refs para elementos do DOM
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Funções para gerenciar formulário
  const updateFormData = useCallback((updates: Partial<PedidoFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  }, []);

  // Ativação da câmera
  const activateCamera = useCallback(async () => {
    try {
      setCameraState(prev => ({ ...prev, isReady: false }));
      
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'environment',
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        }
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setCameraState({
          isActive: true,
          isReady: true,
          hasImage: false
        });
        showNotification('📷 Câmera ativada com sucesso!', 'success');
      }
    } catch (error) {
      console.error('Erro ao ativar câmera:', error);
      setCameraState(prev => ({ ...prev, isReady: true }));
      showNotification('❌ Erro ao ativar câmera', 'error');
    }
  }, [showNotification]);

  // Captura de imagem
  const captureImage = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current) return;

    try {
      setFormState(prev => ({ ...prev, isProcessing: true }));
      
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      if (context) {
        context.drawImage(video, 0, 0);
        const imageDataUrl = canvas.toDataURL('image/jpeg', 0.9);
        
        // Simular processamento OCR
        await simulateOCRProcessing(imageDataUrl);
        
        setCameraState(prev => ({ ...prev, hasImage: true }));
        setFormState(prev => ({ ...prev, currentStep: 2 }));
      }
    } catch (error) {
      console.error('Erro ao capturar imagem:', error);
      showNotification('❌ Erro ao processar imagem', 'error');
    } finally {
      setFormState(prev => ({ ...prev, isProcessing: false }));
    }
  }, [showNotification]);

  // Simulação de processamento OCR (baseado nas imagens fornecidas)
  const simulateOCRProcessing = useCallback(async (imageDataUrl: string) => {
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Dados simulados baseados nas ordens reais mostradas
    const mockData: ProcessedPedidoData = {
      numeroOrdem: 'OP-1609',
      dataEntrega: '2025-01-26',
      cliente: {
        razaoSocial: 'SONIA MARIA TREVIZAN SOROCABA',
        nomeFantasia: 'PONTO DE BALA',
        cnpj: '01.112.578/0001-00',
        endereco: 'R JOSE LUIZ FLAQUER, 667 (SALA 01) - EDEN',
        cep: '18103-000',
        telefone: '',
        email: ''
      },
      produtos: [
        { item: 1, nome: 'Saco Mix 2kg', unidade: 'MIL', quantidade: 2.000 },
        { item: 2, nome: 'Saco Mix 4kg', unidade: 'MIL', quantidade: 8.000 },
        { item: 3, nome: 'Saco Mix 5kg', unidade: 'MIL', quantidade: 2.000 },
        { item: 4, nome: 'Hamburgão - Mono 30gr', unidade: 'MIL', quantidade: 5.000 }
      ],
      quantidadeTotal: 17.000
    };

    setProcessedData(mockData);
    setFormState(prev => ({ ...prev, hasExtractedData: true }));
    
    // Auto-preencher formulário com dados processados
    setFormData(prev => ({
      ...prev,
      numeroOrdem: mockData.numeroOrdem,
      dataEntrega: mockData.dataEntrega,
      cliente: mockData.cliente,
      produtos: mockData.produtos.map(produto => ({
        ...produto,
        maquinaSugerida: sugerirMaquina(produto.nome)
      }))
    }));

    showNotification('✅ Ordem de produção processada com sucesso!', 'success');
  }, []);

  // Sugerir máquina baseado no produto
  const sugerirMaquina = (nomeProduto: string): string => {
    // Produtos especiais vão para máquina 9
    if (nomeProduto.includes('Mono') || nomeProduto.includes('Viagem')) {
      return 'Máquina 9';
    }
    
    // Outros produtos distribuídos entre máquinas 1-8
    const maquinasNormais = MAQUINAS_DISPONIVEIS.filter(m => m.tipo === 'normal');
    const randomIndex = Math.floor(Math.random() * maquinasNormais.length);
    return maquinasNormais[randomIndex].nome;
  };

  // Upload de arquivo
  const uploadImage = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        setFormState(prev => ({ ...prev, isProcessing: true }));
        
        const reader = new FileReader();
        reader.onload = async (e) => {
          const imageDataUrl = e.target?.result as string;
          await simulateOCRProcessing(imageDataUrl);
          setCameraState(prev => ({ ...prev, hasImage: true }));
          setFormState(prev => ({ ...prev, currentStep: 2, isProcessing: false }));
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  }, [simulateOCRProcessing]);

  // Salvar pedido
  const savePedido = useCallback(async () => {
    try {
      setFormState(prev => ({ ...prev, isProcessing: true }));
      
      // Simulação de salvamento
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      showNotification(`✅ Pedido ${formData.numeroOrdem} salvo com sucesso!`, 'success');
      
      // Reset do formulário
      setFormData({
        numeroOrdem: '',
        dataEntrega: new Date().toISOString().split('T')[0],
        prioridade: 'media',
        tipo: 'neutro',
        cliente: {
          razaoSocial: '',
          nomeFantasia: '',
          cnpj: '',
          endereco: '',
          cep: '',
          telefone: '',
          email: ''
        },
        produtos: [],
        observacoes: ''
      });
      
      setCameraState({
        isActive: false,
        isReady: true,
        hasImage: false
      });
      
      setFormState({
        isProcessing: false,
        hasExtractedData: false,
        currentStep: 1
      });
      
      setProcessedData(null);
      
    } catch (error) {
      console.error('Erro ao salvar pedido:', error);
      showNotification('❌ Erro ao salvar pedido', 'error');
    } finally {
      setFormState(prev => ({ ...prev, isProcessing: false }));
    }
  }, [formData, showNotification]);

  // Reset do processo
  const resetProcess = useCallback(() => {
    // Parar câmera se estiver ativa
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    
    setCameraState({
      isActive: false,
      isReady: true,
      hasImage: false
    });
    
    setFormState({
      isProcessing: false,
      hasExtractedData: false,
      currentStep: 1
    });
    
    setProcessedData(null);
  }, []);

  return {
    // Estados
    formData,
    cameraState,
    formState,
    processedData,
    
    // Refs
    videoRef,
    canvasRef,
    
    // Actions
    updateFormData,
    activateCamera,
    captureImage,
    uploadImage,
    savePedido,
    resetProcess
  };
};