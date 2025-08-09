import React, { useState } from 'react'
import { Save, RotateCcw } from 'lucide-react'
import { useNovaBobina } from '@/hooks/useNovaBobina'
import {
  CameraSection,
  FormSection,
  StatusControl,
  StatsSection,
  ProcessingStatus
} from '@/components/nova-bobina'

export const NovaBobinaPage: React.FC = () => {
  const {
    formData,
    cameraState,
    formState,
    processedData,
    videoRef,
    canvasRef,
    updateFormData,
    updateStatus,
    activateCamera,
    captureImage,
    uploadImage,
    saveBobina,
    clearForm,
    returnToStock
  } = useNovaBobina()

  const [isSaving, setIsSaving] = useState(false)
  const [processProgress, setProcessProgress] = useState(0)
  const [processMessage, setProcessMessage] = useState('')

  const handleSave = async () => {
    setIsSaving(true)
    const success = await saveBobina()
    
    if (success) {
      setTimeout(() => {
        clearForm()
        setIsSaving(false)
      }, 2000)
    } else {
      setIsSaving(false)
    }
  }

  const steps = ['Captura', 'Processamento', 'Confirmação']

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-3 sm:p-4 lg:p-6 xl:p-8">
        {/* Title Section - Mobile Optimized */}
        <div className="mb-6 lg:mb-8 text-center">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 lg:mb-4 leading-tight">
            Nova Bobina
          </h1>
          <p className="text-gray-600 text-sm sm:text-base lg:text-lg max-w-2xl mx-auto leading-relaxed">
            Registre uma nova bobina via análise inteligente de imagem do rótulo
          </p>
        </div>

        {/* Main Content Grid - Responsive Enhanced */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6">
          {/* Camera Section - Full width on mobile, 1 col on lg+, 1 col on xl+ */}
          <div className="lg:col-span-1 xl:col-span-1">
            <CameraSection
              cameraState={cameraState}
              isProcessing={formState.isProcessing}
              videoRef={videoRef}
              canvasRef={canvasRef}
              onActivateCamera={activateCamera}
              onCaptureImage={captureImage}
              onUploadImage={uploadImage}
            />
          </div>

          {/* Form Section - Full width on mobile, 1 col on lg+, 2 cols on xl+ */}
          <div className="lg:col-span-1 xl:col-span-2">
            <FormSection
              formData={formData}
              formState={formState}
              onUpdateFormData={updateFormData}
            />
          </div>
        </div>

        {/* Status Control Section - Full width, Enhanced spacing */}
        <div className="mt-6 lg:mt-8">
          <StatusControl
            formData={formData}
            onUpdateFormData={updateFormData}
            onUpdateStatus={updateStatus}
            onReturnToStock={returnToStock}
          />
        </div>

        {/* Action Buttons - Enhanced for desktop */}
        <div className="mt-6 lg:mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={handleSave}
            disabled={!formData.codigoBobina || isSaving}
            className="w-full bg-green-600 text-white py-4 lg:py-5 px-6 rounded-xl hover:bg-green-700 transition-all duration-200 flex items-center justify-center space-x-3 text-base lg:text-lg font-semibold shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
          >
            {isSaving ? (
              <>
                <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin" />
                <span>Salvando Bobina...</span>
              </>
            ) : (
              <>
                <Save className="w-6 h-6" />
                <span>Salvar Bobina</span>
              </>
            )}
          </button>
          
          <button
            onClick={clearForm}
            disabled={isSaving}
            className="w-full bg-gray-600 text-white py-4 lg:py-5 px-6 rounded-xl hover:bg-gray-700 transition-all duration-200 flex items-center justify-center space-x-3 text-base lg:text-lg font-semibold shadow-lg hover:shadow-xl disabled:opacity-50"
          >
            <RotateCcw className="w-5 h-5 lg:w-6 lg:h-6" />
            <span>Limpar Formulário</span>
          </button>
        </div>

        {/* Processing Status - Mobile Enhanced */}
        <div className="mt-8">
          <ProcessingStatus
            isVisible={formState.isProcessing}
            progress={processProgress}
            message={processMessage}
          />
        </div>

        {/* Statistics Section - Mobile Enhanced */}
        <div className="mt-8">
          <StatsSection />
        </div>
      </div>
    </div>
  )
}

export default NovaBobinaPage
