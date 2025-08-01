import React, { useState } from 'react'
import { Save, RotateCcw } from 'lucide-react'
import { useNovaBobina } from '@/hooks/useNovaBobina'
import {
  StepIndicator,
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
    <div className="max-w-7xl mx-auto p-3 md:p-6">
      {/* Title Section */}
      <div className="mb-6 text-center px-2">
        <h2 className="text-4xl font-bold text-gray-800 mb-3"> Nova Bobina</h2>
        <p className="text-gray-600 text-lg px-4">
          Registre uma nova bobina via análise inteligente de imagem do rótulo
        </p>
      </div>

      {/* Step Indicator */}
      <StepIndicator 
        currentStep={formState.currentStep} 
        steps={steps}
      />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        {/* Camera Section */}
        <CameraSection
          cameraState={cameraState}
          isProcessing={formState.isProcessing}
          videoRef={videoRef}
          canvasRef={canvasRef}
          onActivateCamera={activateCamera}
          onCaptureImage={captureImage}
          onUploadImage={uploadImage}
        />

        {/* Form Section */}
        <FormSection
          formData={formData}
          formState={formState}
          onUpdateFormData={updateFormData}
        />
      </div>

      {/* Status Control Section */}
      <div className="mt-4 md:mt-6">
        <StatusControl
          formData={formData}
          onUpdateFormData={updateFormData}
          onUpdateStatus={updateStatus}
          onReturnToStock={returnToStock}
        />
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col space-y-3 mt-6">
        <button
          onClick={handleSave}
          disabled={!formData.codigoBobina || isSaving}
          className="w-full bg-green-600 text-white py-4 px-4 rounded-lg hover:bg-green-700 transition flex items-center justify-center space-x-2 min-h-[56px] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSaving ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span className="font-semibold">Salvando...</span>
            </>
          ) : (
            <>
              <Save className="w-5 h-5" />
              <span className="font-semibold">Salvar Bobina</span>
            </>
          )}
        </button>
        
        <button
          onClick={clearForm}
          disabled={isSaving}
          className="w-full bg-gray-600 text-white py-3 px-4 rounded-lg hover:bg-gray-700 transition flex items-center justify-center space-x-2 min-h-[48px] disabled:opacity-50"
        >
          <RotateCcw className="w-5 h-5" />
          <span>Limpar Formulário</span>
        </button>
      </div>

      {/* Processing Status */}
      <ProcessingStatus
        isVisible={formState.isProcessing}
        progress={processProgress}
        message={processMessage}
        className="mt-8"
      />

      {/* Statistics Section */}
      <StatsSection className="mt-4 md:mt-6" />
    </div>
  )
}

export default NovaBobinaPage
