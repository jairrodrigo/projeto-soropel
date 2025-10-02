import { useCallback, useEffect, useRef, useState } from 'react'

export type CameraDevice = {
  deviceId: string
  label: string
}

type StartOptions = {
  deviceId?: string | null
}

export function useCamera() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const [devices, setDevices] = useState<CameraDevice[]>([])
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null)

  const isLocalhost = ['localhost', '127.0.0.1', '[::1]'].includes(typeof window !== 'undefined' ? window.location.hostname : '')
  const isSecure = typeof window !== 'undefined' ? (window.isSecureContext || isLocalhost) : false

  const stopCamera = useCallback(() => {
    const video = videoRef.current
    if (video?.srcObject) {
      const stream = video.srcObject as MediaStream
      stream.getTracks().forEach(t => t.stop())
      video.srcObject = null
    }
  }, [])

  const waitForVideo = useCallback(async (retries = 20, delayMs = 150): Promise<HTMLVideoElement | null> => {
    for (let i = 0; i < retries; i++) {
      const v = videoRef.current
      if (v) return v
      await new Promise(res => setTimeout(res, delayMs))
    }
    return null
  }, [])

  const refreshDevices = useCallback(async (): Promise<CameraDevice[]> => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
      throw new Error('MediaDevicesNotSupported')
    }
    try {
      const all = await navigator.mediaDevices.enumerateDevices()
      const vids = all.filter(d => d.kind === 'videoinput')
      const mapped = vids.map((d, idx) => ({ deviceId: d.deviceId, label: d.label || `Câmera ${idx + 1}` }))
      setDevices(mapped)
      if (mapped.length > 0 && !selectedDeviceId) setSelectedDeviceId(mapped[0].deviceId)
      return mapped
    } catch (err) {
      console.warn('Falha ao enumerar dispositivos de vídeo:', err)
      // Em alguns cenários, enumerateDevices pode retornar vazio sem permissão. Tentaremos getUserMedia a seguir.
      return []
    }
  }, [selectedDeviceId])

  const ensurePermissionByProbing = useCallback(async () => {
    // Em navegadores como Chrome, labels de devices só aparecem após permissão.
    // Se enumerateDevices vier vazio, tente um getUserMedia básico para disparar o prompt.
    try {
      await navigator.mediaDevices.getUserMedia({ video: true })
    } catch (err: any) {
      // Diferenciar erros comuns
      if (err?.name === 'NotAllowedError') throw new Error('PermissionDenied')
      if (err?.name === 'NotFoundError') throw new Error('NoVideoDevicesFound')
      if (err?.name === 'NotReadableError') throw new Error('DeviceBusy')
      throw err
    }
  }, [])

  const startCamera = useCallback(async (opts: StartOptions = {}) => {
    if (!isSecure) {
      throw new Error('SecureContextRequired')
    }
    const video = await waitForVideo(30, 150)
    if (!video) {
      throw new Error('VideoElementNotFound')
    }

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      throw new Error('MediaDevicesNotSupported')
    }

    // Limpar qualquer stream anterior
    stopCamera()

    // Garantir playsinline para iOS/Safari
    try {
      // @ts-ignore
      video.setAttribute('playsinline', 'true')
      video.setAttribute('muted', 'true')
      // @ts-ignore
      video.muted = true
    } catch {}

    // Se não temos devices, tentar disparar permissão e re-enumerar
    let list = devices
    if (!list || list.length === 0) {
      try {
        await ensurePermissionByProbing()
      } catch (err) {
        throw err
      }
      list = await refreshDevices()
    }

    const deviceId = opts.deviceId ?? selectedDeviceId ?? (list[0]?.deviceId ?? null)

    const tryConstraints = async (): Promise<MediaStream> => {
      // Tentar com deviceId específico se existir
      if (deviceId) {
        try {
          return await navigator.mediaDevices.getUserMedia({ video: { deviceId } })
        } catch (err) {
          console.warn('Falha com deviceId específico, tentando facingMode...', err)
        }
      }
      // Tentar câmera traseira (environment)
      try {
        return await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: 'environment' } } })
      } catch (err) {
        console.warn('Falha environment, tentando user...', err)
      }
      // Tentar câmera frontal (user)
      try {
        return await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: 'user' } } })
      } catch (err) {
        console.warn('Falha user, tentando genérico...', err)
      }
      // Genérico
      return await navigator.mediaDevices.getUserMedia({ video: true })
    }

    try {
      const stream = await tryConstraints()
      video.srcObject = stream
      try {
        await video.play()
      } catch (playErr) {
        console.warn('Falha ao dar play no vídeo. Requer interação do usuário?', playErr)
      }
      return true
    } catch (err: any) {
      if (err?.name === 'NotAllowedError') throw new Error('PermissionDenied')
      if (err?.name === 'NotFoundError') throw new Error('NoVideoDevicesFound')
      if (err?.name === 'NotReadableError') throw new Error('DeviceBusy')
      throw err
    }
  }, [devices, ensurePermissionByProbing, isSecure, refreshDevices, selectedDeviceId, stopCamera, waitForVideo])

  const captureImage = useCallback((type: 'image/png' | 'image/jpeg' = 'image/png', quality?: number) => {
    const video = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas) throw new Error('CaptureRefsMissing')
    const w = video.videoWidth || video.clientWidth
    const h = video.videoHeight || video.clientHeight
    canvas.width = w
    canvas.height = h
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('CanvasContextMissing')
    ctx.drawImage(video, 0, 0, w, h)
    return canvas.toDataURL(type, quality)
  }, [])

  useEffect(() => {
    // Atualizar devices ao montar
    refreshDevices().catch(err => console.warn('Não foi possível atualizar devices ao montar:', err))
    return () => {
      stopCamera()
    }
  }, [refreshDevices, stopCamera])

  return {
    videoRef,
    canvasRef,
    devices,
    selectedDeviceId,
    setSelectedDeviceId,
    startCamera,
    stopCamera,
    captureImage,
    refreshDevices,
    isSecureContext: isSecure,
  }
}