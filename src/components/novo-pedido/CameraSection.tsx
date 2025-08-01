import React from 'react';
import { Camera, Upload, Check, FileText, Loader2 } from 'lucide-react';
import { cn } from '@/utils';
import type { CameraState } from '@/types/novo-pedido';

interface CameraSectionProps {
  cameraState: CameraState;
  isProcessing?: boolean;
  videoRef: React.RefObject<HTMLVideoElement>;
  canvasRef: React.RefObject<HTMLCanvasElement>;
  onActivateCamera: () => void;
  onCaptureImage: () => void;
  onUploadImage: () => void;
}

export const CameraSection: React.FC<CameraSectionProps> = ({
  cameraState,
  isProcessing = false,
  videoRef,
  canvasRef,
  onActivateCamera,
  onCaptureImage,
  onUploadImage
}) => {
  const { isActive, isReady, hasImage } = cameraState;

  return (
    <div className="bg-white p-4 md:p-6 rounded-xl shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Captura da Ordem de Produção</h3>
        <div className="flex items-center space-x-2">
          <div className={cn(
            'w-3 h-3 rounded-full',
            isActive ? 'bg-blue-500' : isReady ? 'bg-green-500' : 'bg-yellow-500'
          )} />
          <span className={cn(
            'text-sm',
            isActive ? 'text-blue-600' : isReady ? 'text-green-600' : 'text-yellow-600'
          )}>
            {isActive ? 'Câmera Ativa' : isReady ? 'Câmera Pronta' : 'Processando'}
          </span>
        </div>
      </div>
      
      <div className="space-y-4">
        {/* Camera Preview */}
        <div className="relative h-80 rounded-lg overflow-hidden bg-gray-100 border-2 border-dashed border-gray-300">
          {isActive ? (
            <>
              <video
                ref={videoRef}
                className="w-full h-full object-cover"
                autoPlay
                playsInline
                muted
              />
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-60 border-2 border-green-400 border-dashed rounded-lg animate-pulse" />
                <div className="absolute top-4 left-4 text-white bg-black bg-opacity-50 px-2 py-1 rounded text-sm">
                  Posicione a ordem de produção aqui
                </div>
                <div className="absolute bottom-4 left-4 text-white bg-black bg-opacity-50 px-2 py-1 rounded text-xs">
                  Formato A4 - certifique-se de que o documento está bem iluminado
                </div>
              </div>
              
              {/* OCR Processing Overlay */}
              {isProcessing && (
                <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center z-10">
                  <div className="text-center text-white">
                    <Loader2 className="w-12 h-12 mx-auto mb-4 animate-spin" />
                    <p className="text-lg font-semibold">Analisando Documento...</p>
                    <p className="text-sm opacity-80">IA processando ordem de produção</p>
                  </div>
                </div>
              )}
            </>
          ) : hasImage ? (
            <div className="w-full h-full bg-green-100 flex items-center justify-center">
              <div className="text-center">
                <Check className="w-16 h-16 text-green-600 mx-auto mb-4" />
                <p className="text-lg font-semibold text-green-800">Ordem Capturada!</p>
                <p className="text-sm text-green-600">Dados extraídos com sucesso</p>
              </div>
            </div>
          ) : (
            <>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 mb-2">Posicione a ordem de produção</p>
                  <p className="text-sm text-gray-400">Documento deve estar bem iluminado e legível</p>
                </div>
              </div>
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-60 border-2 border-blue-500 border-dashed rounded-lg animate-pulse" />
                <div className="absolute top-4 left-4 text-white bg-black bg-opacity-50 px-2 py-1 rounded text-sm">
                  Área de captura da ordem
                </div>
              </div>
            </>
          )}
        </div>

        {/* Hidden canvas for image capture */}
        <canvas ref={canvasRef} className="hidden" />

        {/* Camera Controls */}
        <div className="flex flex-col md:flex-row space-y-3 md:space-y-0 md:space-x-3">
          <button
            onClick={onActivateCamera}
            disabled={isActive}
            className={cn(
              'flex-1 py-3 px-4 rounded-lg transition flex items-center justify-center space-x-2',
              isActive 
                ? 'bg-green-600 text-white cursor-not-allowed' 
                : 'bg-blue-600 text-white hover:bg-blue-700'
            )}
          >
            <Camera className="w-5 h-5" />
            <span>{isActive ? 'Câmera Ativa' : 'Ativar Câmera'}</span>
          </button>
          <button
            onClick={onUploadImage}
            className="flex-1 bg-gray-600 text-white py-3 px-4 rounded-lg hover:bg-gray-700 transition flex items-center justify-center space-x-2"
          >
            <Upload className="w-5 h-5" />
            <span>Upload Arquivo</span>
          </button>
        </div>

        {/* Capture Button */}
        {isActive && (
          <button
            onClick={onCaptureImage}
            className="w-full bg-green-600 text-white py-4 px-6 rounded-lg hover:bg-green-700 transition flex items-center justify-center space-x-2"
          >
            <Camera className="w-6 h-6" />
            <span className="text-lg font-semibold">CAPTURAR ORDEM</span>
          </button>
        )}

        {/* Tips */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="text-sm font-medium text-blue-800 mb-2">📋 Dicas para melhor captura:</h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Posicione a ordem de produção completamente dentro da área marcada</li>
            <li>• Certifique-se de que todos os dados estão legíveis</li>
            <li>• Use iluminação adequada (evite sombras e reflexos)</li>
            <li>• Mantenha o documento plano (sem dobras)</li>
            <li>• Distância recomendada: 30-40cm do documento</li>
            <li>• Formato aceito: Ordens de produção Soropel padrão</li>
          </ul>
        </div>
      </div>
    </div>
  );
};