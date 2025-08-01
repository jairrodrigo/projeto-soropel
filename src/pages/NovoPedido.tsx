import React from 'react';
import { Save, RotateCcw, CheckCircle2 } from 'lucide-react';
import { useNovoPedido } from '@/hooks/useNovoPedido';
import { CameraSection, ProcessingStatus, FormSection } from '@/components/novo-pedido';

export const NovoPedidoPage: React.FC = () => {
  const {
    formData,
    cameraState,
    formState,
    processedData,
    videoRef,
    canvasRef,
    updateFormData,
    activateCamera,
    captureImage,
    uploadImage,
    savePedido,
    resetProcess
  } = useNovoPedido();

  const canSave = formData.numeroOrdem && formData.cliente.nomeFantasia && formData.produtos.length > 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Novo Pedido</h1>
            <p className="text-gray-600">Capture uma ordem de produção para criar um novo pedido</p>
          </div>
          
          {formState.hasExtractedData && (
            <div className="flex items-center space-x-2 bg-green-100 px-4 py-2 rounded-lg">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              <span className="text-sm font-medium text-green-800">
                Dados extraídos: {processedData?.produtos.length || 0} produtos
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Coluna Esquerda - Câmera e Status */}
        <div className="lg:col-span-1 space-y-6">
          <CameraSection
            cameraState={cameraState}
            isProcessing={formState.isProcessing}
            videoRef={videoRef}
            canvasRef={canvasRef}
            onActivateCamera={activateCamera}
            onCaptureImage={captureImage}
            onUploadImage={uploadImage}
          />
          
          <ProcessingStatus
            isProcessing={formState.isProcessing}
            hasExtractedData={formState.hasExtractedData}
            currentStep={formState.currentStep}
          />
        </div>

        {/* Coluna Direita - Formulário */}
        <div className="lg:col-span-2">
          <FormSection
            formData={formData}
            onUpdateFormData={updateFormData}
            hasExtractedData={formState.hasExtractedData}
          />
        </div>
      </div>

      {/* Ações */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex flex-col md:flex-row gap-4 justify-end">
          <button
            onClick={resetProcess}
            className="flex items-center justify-center space-x-2 px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
          >
            <RotateCcw className="w-5 h-5" />
            <span>Reiniciar</span>
          </button>
          
          <button
            onClick={savePedido}
            disabled={!canSave || formState.isProcessing}
            className={`flex items-center justify-center space-x-2 px-8 py-3 rounded-lg transition ${
              canSave && !formState.isProcessing
                ? 'bg-green-600 text-white hover:bg-green-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            <Save className="w-5 h-5" />
            <span className="font-semibold">
              {formState.isProcessing ? 'Salvando...' : 'Salvar Pedido'}
            </span>
          </button>
        </div>
        
        {!canSave && (
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-600">
              ℹ️ Preencha os campos obrigatórios: Número da ordem, Nome do cliente e pelo menos um produto
            </p>
          </div>
        )}
      </div>

      {/* Resumo dos Dados Extraídos */}
      {processedData && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-4">
            Resumo dos Dados Extraídos
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="font-medium text-blue-800">Ordem: {processedData.numeroOrdem}</p>
              <p className="text-blue-700">Cliente: {processedData.cliente.nomeFantasia}</p>
              <p className="text-blue-700">Entrega: {new Date(processedData.dataEntrega).toLocaleDateString('pt-BR')}</p>
            </div>
            <div>
              <p className="font-medium text-blue-800">Total de Produtos: {processedData.produtos.length}</p>
              <p className="text-blue-700">Quantidade Total: {processedData.quantidadeTotal.toFixed(3)} MIL</p>
              <p className="text-blue-700">CNPJ: {processedData.cliente.cnpj}</p>
            </div>
          </div>
          
          <div className="mt-4">
            <p className="text-xs text-blue-600">
              ✨ Dados processados automaticamente via OCR. Revise e edite conforme necessário antes de salvar.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};