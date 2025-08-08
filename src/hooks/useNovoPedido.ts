import { useState, useCallback, useRef } from 'react';
import { useUIStore } from '@/stores';
import type { 
  PedidoFormData, 
  ProcessedPedidoData, 
  CameraState, 
  FormState
} from '@/types/novo-pedido';
import { MAQUINAS_DISPONIVEIS } from '@/types/novo-pedido';
import { createOrder, type NewOrderData } from '@/services/ordersService';
import { analyzePedidoDocument } from '@/services/ocrService';

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
      }
    } catch (error) {
      console.error('Erro ao ativar câmera:', error);
      setCameraState(prev => ({ ...prev, isReady: true }));
      showNotification({ message: '❌ Erro ao ativar câmera', type: 'error' });
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
        
        // Criar blob da imagem capturada para OCR real
        canvas.toBlob(async (blob) => {
          if (blob) {
            try {
              await processDocumentOCR(blob);
              setCameraState(prev => ({ ...prev, hasImage: true }));
              setFormState(prev => ({ ...prev, currentStep: 2 }));
            } catch (error) {
              console.error('❌ Erro no processamento OCR:', error);
              showNotification({ message: '❌ Erro ao processar imagem', type: 'error' });
              setFormState(prev => ({ ...prev, isProcessing: false }));
            }
          } else {
            console.error('❌ Erro: blob da imagem é null');
            showNotification({ message: '❌ Erro ao capturar imagem', type: 'error' });
            setFormState(prev => ({ ...prev, isProcessing: false }));
          }
        }, 'image/jpeg', 0.9);
      }
    } catch (error) {
      console.error('Erro ao capturar imagem:', error);
      showNotification({ message: '❌ Erro ao processar imagem', type: 'error' });
    } finally {
      setFormState(prev => ({ ...prev, isProcessing: false }));
    }
  }, [showNotification]);

  // 🤖 PROCESSAMENTO REAL VIA OCR + OPENAI VISION API
  const processDocumentOCR = useCallback(async (imageBlob: Blob) => {
    setFormState(prev => ({ ...prev, isProcessing: true }));
    
    try {
      console.log('🤖 Iniciando análise OCR real do documento...');
      
      // 🧠 ANÁLISE REAL VIA OPENAI VISION API
      const ocrResult = await analyzePedidoDocument(imageBlob);
      
      // ✅ Log removido para console limpo;
      
      // Converter resultado OCR para formato do frontend
      const processedPedidoData: ProcessedPedidoData = {
        numeroOrdem: ocrResult.numeroOrdem || `OP-2025-${Date.now().toString().slice(-6)}`,
        dataEntrega: ocrResult.dataEntrega || new Date().toISOString().split('T')[0],
        cliente: {
          razaoSocial: ocrResult.cliente?.razaoSocial || 'Cliente Identificado',
          nomeFantasia: ocrResult.cliente?.nomeFantasia || '',
          cnpj: ocrResult.cliente?.cnpj || '',
          endereco: ocrResult.cliente?.endereco || '',
          cep: ocrResult.cliente?.cep || '',
          telefone: ocrResult.cliente?.telefone || '',
          email: ocrResult.cliente?.email || ''
        },
        produtos: ocrResult.produtos?.map(produto => ({
          item: produto.item,
          nome: produto.nome,
          unidade: produto.unidade as 'MIL' | 'KG' | 'UND',
          quantidade: produto.quantidade
        })) || [],
        quantidadeTotal: ocrResult.produtos?.reduce((sum, p) => sum + p.quantidade, 0) || 0
      };
      
      setProcessedData(processedPedidoData);
      setFormState(prev => ({ ...prev, hasExtractedData: true }));
      
      // Auto-preencher formulário com dados processados
      setFormData(prev => ({
        ...prev,
        numeroOrdem: processedPedidoData.numeroOrdem,
        dataEntrega: processedPedidoData.dataEntrega,
        cliente: processedPedidoData.cliente,
        produtos: processedPedidoData.produtos.map(produto => ({
          ...produto,
          maquinaSugerida: sugerirMaquina(produto.nome)
        }))
      }));
      
    } catch (error) {
      console.error('❌ Erro no OCR real:', error);
      showNotification({ message: '❌ Erro na análise OCR - usando dados padrão', type: 'error' });
      
      // Fallback para dados simulados em caso de erro
      const fallbackData: ProcessedPedidoData = {
        numeroOrdem: `OP-ERRO-${Date.now().toString().slice(-6)}`,
        dataEntrega: new Date().toISOString().split('T')[0],
        cliente: {
          razaoSocial: 'Cliente - Erro OCR',
          nomeFantasia: '',
          cnpj: '',
          endereco: '',
          cep: '',
          telefone: '',
          email: ''
        },
        produtos: [
          { item: 1, nome: 'Produto Padrão', unidade: 'MIL', quantidade: 1.000 }
        ],
        quantidadeTotal: 1.000
      };
      
      setProcessedData(fallbackData);
      setFormState(prev => ({ ...prev, hasExtractedData: true }));
    } finally {
      setFormState(prev => ({ ...prev, isProcessing: false }));
    }
  }, [showNotification]);

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
        try {
          setFormState(prev => ({ ...prev, isProcessing: true }));
          
          // Processar arquivo diretamente como blob para OCR real
          await processDocumentOCR(file);
          setCameraState(prev => ({ ...prev, hasImage: true }));
          setFormState(prev => ({ ...prev, currentStep: 2, isProcessing: false }));
        } catch (error) {
          console.error('❌ Erro no upload:', error);
          showNotification({ message: '❌ Erro ao processar arquivo', type: 'error' });
          setFormState(prev => ({ ...prev, isProcessing: false }));
        }
      }
    };
    input.click();
  }, [processDocumentOCR]);

  // Salvar pedido REAL - integração Supabase
  const savePedido = useCallback(async () => {
    try {
      setFormState(prev => ({ ...prev, isProcessing: true }));
      
      // ✅ Log removido para console limpo;
      
      // Preparar dados para o service
      const orderData: NewOrderData = {
        order_number: formData.numeroOrdem,
        client_id: null, // Será determinado automaticamente
        delivery_date: formData.dataEntrega,
        priority: formData.prioridade, // Service converte automaticamente
        observations: formData.observacoes,
        cliente: formData.cliente.razaoSocial ? {
          razaoSocial: formData.cliente.razaoSocial,
          nomeFantasia: formData.cliente.nomeFantasia,
          cnpj: formData.cliente.cnpj,
          endereco: formData.cliente.endereco,
          cep: formData.cliente.cep,
          telefone: formData.cliente.telefone,
          email: formData.cliente.email
        } : undefined,
        produtos: formData.produtos.map(produto => ({
          nome: produto.nome,
          soropel_code: produto.codigoSoropel,
          quantidade: produto.quantidade,
          maquinaSugerida: produto.maquinaSugerida
        }))
      };
      
      // Criar pedido usando service real
      const result = await createOrder(orderData);
      
      if (result.error) {
        console.error('❌ Erro do service:', result.error);
        showNotification({ message: `❌ Erro ao salvar: ${result.error}`, type: 'error' });
        return;
      }
      
      if (result.data) {
        // ✅ Pedido salvo - log removido para console limpo
        
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
      }
      
    } catch (error) {
      console.error('❌ Erro inesperado ao salvar pedido:', error);
      showNotification({ message: '❌ Erro inesperado ao salvar pedido', type: 'error' });
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