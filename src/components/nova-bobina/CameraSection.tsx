import React from 'react'
import { Camera, Upload, Check, Loader2, Clipboard } from 'lucide-react'
import { cn } from '@/utils'
import type { CameraState } from '@/types/nova-bobina'

interface CameraSectionProps {
  cameraState: CameraState
  isProcessing?: boolean
  videoRef: React.RefObject<HTMLVideoElement>
  // Canvas usado para PROCESSAMENTO (offscreen/oculto)
  canvasRef: React.RefObject<HTMLCanvasElement>
  // Canvas usado para EXIBIÇÃO da imagem capturada
  displayCanvasRef: React.RefObject<HTMLCanvasElement>
  onActivateCamera: () => void
  onCaptureImage: () => void
  onUploadImage: () => void
}

export const CameraSection: React.FC<CameraSectionProps> = ({
  cameraState,
  isProcessing = false,
  videoRef,
  canvasRef,
  displayCanvasRef,
  onActivateCamera,
  onCaptureImage,
  onUploadImage
}) => {
  const { isActive, isReady, hasImage } = cameraState

  return (
    <div className="bg-white p-3 sm:p-4 lg:p-6 rounded-xl lg:rounded-2xl shadow-lg lg:shadow-xl border border-gray-100">
      {/* Header - Mobile Enhanced */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 lg:mb-6 space-y-2 sm:space-y-0">
        <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 flex items-center">
          <Camera className="w-5 h-5 lg:w-6 lg:h-6 mr-2 lg:mr-3 text-blue-600" />
          Captura de Imagem
        </h3>
        <div className="flex items-center space-x-2 lg:space-x-3 bg-gray-50 px-3 lg:px-4 py-1.5 lg:py-2 rounded-full">
          <div className={cn(
            'w-3 h-3 lg:w-4 lg:h-4 rounded-full transition-colors',
            isActive ? 'bg-blue-500 animate-pulse' : 
            isReady ? 'bg-green-500' : 'bg-yellow-500'
          )} />
          <span className={cn(
            'text-xs lg:text-sm font-medium',
            isActive ? 'text-blue-700' : 
            isReady ? 'text-green-700' : 'text-yellow-700'
          )}>
            {isActive ? 'Câmera Ativa' : 
             isReady ? 'Câmera Pronta' : 'Processando'}
          </span>
        </div>
      </div>
      
      {/* Instruction Text */}
      <div className="mb-4 lg:mb-6 text-center">
        <p className="text-gray-600 text-sm lg:text-base font-medium">
          Capture ou faça upload da imagem do rótulo
        </p>
      </div>
      
      <div className="space-y-4 lg:space-y-6">
        {/* Camera Preview - Enhanced for Mobile */}
        <div className="relative h-48 sm:h-56 lg:h-64 xl:h-72 rounded-lg lg:rounded-xl overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 border-2 border-dashed border-gray-300">
          {isActive ? (
            <>
              <video
                ref={videoRef}
                className="w-full h-full object-cover"
                autoPlay
                playsInline
                muted
              />
              {/* Camera Overlay Guide */}
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute inset-4 border-2 border-white border-dashed rounded-lg opacity-70">
                  <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-white px-3 py-1 rounded-full text-xs font-medium text-gray-700 shadow-sm flex items-center">
                    <Clipboard className="w-3 h-3 mr-1" />
                    Posicione o rótulo aqui
                  </div>
                </div>
              </div>
            </>
          ) : hasImage ? (
            <div className="relative h-full">
              {/* Show captured image */}
              <canvas 
                ref={displayCanvasRef} 
                className="w-full h-full object-cover rounded-lg"
                style={{ display: 'block' }}
              />
              {/* Processing overlay */}
              {isProcessing && (
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                  <div className="text-center text-white space-y-3">
                    <Loader2 className="w-12 h-12 animate-spin mx-auto" />
                    <p className="text-lg font-semibold">Analisando com IA...</p>
                    <p className="text-sm opacity-75">Extraindo dados do rótulo</p>
                  </div>
                </div>
              )}
              {/* Success overlay when processing complete */}
              {!isProcessing && (
                <div className="absolute top-4 right-4 bg-green-500 text-white p-2 rounded-full shadow-lg">
                  <Check className="w-5 h-5" />
                </div>
              )}
            </div>
          ) : isProcessing ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center space-y-4">
                <Loader2 className="w-12 h-12 text-blue-500 animate-spin mx-auto" />
                <p className="text-lg font-semibold text-blue-700">Analisando...</p>
                <p className="text-sm text-gray-600">IA extraindo dados do rótulo</p>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center space-y-4">
                <Camera className="w-16 h-16 text-gray-400 mx-auto" />
                <p className="text-lg font-semibold text-gray-700">Câmera Pronta</p>
                <p className="text-sm text-gray-500">Ative a câmera ou faça upload</p>
              </div>
            </div>
          )}
        </div>

        {/* Hidden Canvas for Image Processing (único canvas para processamento) */}
        <canvas ref={canvasRef} className="hidden" />

        {/* Camera Controls */}
        <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
          <button
            onClick={onActivateCamera}
            disabled={isActive}
            className={cn(
              'flex-1 py-3 lg:py-4 px-4 lg:px-6 rounded-lg lg:rounded-xl transition flex items-center justify-center space-x-2',
              isActive 
                ? 'bg-green-600 text-white cursor-not-allowed' 
                : 'bg-blue-600 text-white hover:bg-blue-700'
            )}
          >
            <Camera className="w-4 h-4 lg:w-5 lg:h-5" />
            <span className="text-sm lg:text-base font-medium">{isActive ? 'Câmera Ativa' : 'Ativar Câmera'}</span>
          </button>
          <button
            onClick={onUploadImage}
            className="flex-1 bg-purple-600 text-white py-3 lg:py-4 px-4 lg:px-6 rounded-lg lg:rounded-xl hover:bg-purple-700 transition flex items-center justify-center space-x-2"
          >
            <Upload className="w-4 h-4 lg:w-5 lg:h-5" />
            <span className="text-sm lg:text-base font-medium">Upload Imagem</span>
          </button>
        </div>

        {/* Capture Button */}
        {isActive && (
          <button
            onClick={onCaptureImage}
            className="w-full bg-green-600 text-white py-4 lg:py-5 px-4 lg:px-6 rounded-lg lg:rounded-xl hover:bg-green-700 transition flex items-center justify-center space-x-2 lg:space-x-3"
          >
            <Camera className="w-5 h-5 lg:w-6 lg:h-6" />
            <span className="text-base lg:text-lg font-semibold">CAPTURAR IMAGEM</span>
          </button>
        )}
      </div>
    </div>
  )
}
