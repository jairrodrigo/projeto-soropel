import React from 'react';
import { Camera, Upload, FileText, AlertCircle } from 'lucide-react';
import { useUIStore } from '@/stores';

export const NovoPedidoPage: React.FC = () => {
  const { showNotification } = useUIStore();

  const handleCameraCapture = () => {
    showNotification('📷 Funcionalidade de câmera em desenvolvimento...', 'info');
  };

  const handleFileUpload = () => {
    showNotification('📁 Upload de arquivo em desenvolvimento...', 'info');
  };

  const handleManualEntry = () => {
    showNotification('✍️ Entrada manual em desenvolvimento...', 'info');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Novo Pedido</h1>
        <p className="text-gray-600">Registre um novo pedido via imagem ou entrada manual</p>
      </div>

      {/* Status Alert */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
        <div className="flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-yellow-600" />
          <div>
            <h3 className="text-sm font-medium text-yellow-800">Funcionalidade em Desenvolvimento</h3>
            <p className="text-sm text-yellow-700">
              A página completa de Novo Pedido está sendo implementada. 
              Use a página "Pedidos" para gerenciar pedidos existentes.
            </p>
          </div>
        </div>
      </div>

      {/* Options Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Camera Capture */}
        <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <Camera className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Capturar por Câmera</h3>
            <p className="text-sm text-gray-600">
              Fotografe o documento de pedido para processamento automático
            </p>
            <button
              onClick={handleCameraCapture}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Abrir Câmera
            </button>
          </div>
        </div>

        {/* File Upload */}
        <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <Upload className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Upload de Arquivo</h3>
            <p className="text-sm text-gray-600">
              Envie uma imagem ou documento do pedido
            </p>
            <button
              onClick={handleFileUpload}
              className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
            >
              Selecionar Arquivo
            </button>
          </div>
        </div>

        {/* Manual Entry */}
        <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center">
              <FileText className="w-8 h-8 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Entrada Manual</h3>
            <p className="text-sm text-gray-600">
              Digite os dados do pedido manualmente
            </p>
            <button
              onClick={handleManualEntry}
              className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
            >
              Criar Manualmente
            </button>
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Como usar</h3>
        <div className="space-y-3 text-sm text-gray-600">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">1</div>
            <p>Escolha o método de entrada do pedido (câmera, upload ou manual)</p>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">2</div>
            <p>O sistema processará automaticamente os dados do pedido</p>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">3</div>
            <p>Revise e confirme as informações antes de salvar</p>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">4</div>
            <p>O pedido será adicionado à lista de gestão na página "Pedidos"</p>
          </div>
        </div>
      </div>
    </div>
  );
};