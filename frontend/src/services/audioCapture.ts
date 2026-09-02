/**
 * M5A — Audio Capture Foundation.
 *
 * A small, dependency-free controller that wraps the native browser
 * MediaRecorder API. It produces a transient in-memory audio Blob that can be
 * consumed by a later milestone (M5B+ speech-to-text). Nothing here persists,
 * uploads, or analyzes audio — the Blob stays in memory and is released on
 * cancel/cleanup.
 *
 * This is a frontend-only, per-instance controller. It intentionally exposes a
 * minimal contract and does not introduce factories, DI frameworks, event
 * buses, or global recording stores.
 */

export type AudioCaptureState =
  | 'idle'
  | 'requesting-permission'
  | 'recording'
  | 'stopping'
  | 'completed'
  | 'error'

export type AudioCaptureErrorCode =
  | 'unsupported-browser'
  | 'permission-denied'
  | 'microphone-unavailable'
  | 'capture-failure'
  | 'empty-recording'
  | 'stop-failure'
  | 'unknown'

export interface AudioCaptureError {
  code: AudioCaptureErrorCode
  message: string
}

export interface AudioCaptureResult {
  blob: Blob
  mimeType: string
  durationMs: number
}

const MIME_PREFERENCES: Array<{ type: string; required: boolean }> = [
  { type: 'audio/webm;codecs=opus', required: true },
  { type: 'audio/webm', required: true },
  { type: 'audio/mp4', required: true },
  { type: 'audio/ogg;codecs=opus', required: false },
  { type: 'audio/wav', required: false },
]

function isRecordingSupported(): boolean {
  return Boolean(
    typeof navigator !== 'undefined' &&
      navigator.mediaDevices &&
      typeof navigator.mediaDevices.getUserMedia === 'function' &&
      typeof MediaRecorder !== 'undefined',
  )
}

function pickMimeType(): string | undefined {
  for (const candidate of MIME_PREFERENCES) {
    if (
      candidate.required &&
      typeof MediaRecorder.isTypeSupported === 'function' &&
      MediaRecorder.isTypeSupported(candidate.type)
    ) {
      return candidate.type
    }
    if (!candidate.required) {
      try {
        if (
          typeof MediaRecorder.isTypeSupported === 'function' &&
          MediaRecorder.isTypeSupported(candidate.type)
        ) {
          return candidate.type
        }
      } catch {
        /* continue to next candidate */
      }
    }
  }
  return undefined
}

function createError(code: AudioCaptureErrorCode, message: string): AudioCaptureError {
  return { code, message }
}

export class AudioCaptureController {
  private state: AudioCaptureState = 'idle'
  private stream: MediaStream | null = null
  private recorder: MediaRecorder | null = null
  private chunks: Blob[] = []
  private startTime = 0
  private stopTime = 0
  private result: AudioCaptureResult | null = null
  private error: AudioCaptureError | null = null

  private onDataAvailable = (event: BlobEvent): void => {
    const chunk = event.data
    if (chunk && chunk.size > 0) this.chunks.push(chunk)
  }

  private onStop = (): void => {
    this.stopTime = Date.now()
    this.state = 'completed'
    this.finishStop()
  }

  private onError = (): void => {
    this.releaseRecorder()
  }

  getState(): AudioCaptureState {
    return this.state
  }

  getError(): AudioCaptureError | null {
    return this.error
  }

  getResult(): AudioCaptureResult | null {
    return this.result
  }

  getDuration(): number {
    if (this.result) return this.result.durationMs
    if (this.startTime > 0) {
      const end = this.stopTime > 0 ? this.stopTime : Date.now()
      return Math.max(0, end - this.startTime)
    }
    return 0
  }

  hasRecording(): boolean {
    return this.result !== null
  }

  private releaseRecorder(): void {
    if (this.stream) {
      for (const track of this.stream.getTracks()) track.stop()
      this.stream = null
    }
    this.recorder = null
    this.chunks = []
  }

  private reset(): void {
    this.releaseRecorder()
    this.startTime = 0
    this.stopTime = 0
    this.result = null
    this.error = null
    this.state = 'idle'
  }

  private finishStop(): void {
    const stream = this.stream
    if (stream) {
      for (const track of stream.getTracks()) track.stop()
      this.stream = null
    }

    const hasAudio = this.chunks.some((c) => c.size > 0)
    if (!hasAudio) {
      this.error = createError(
        'empty-recording',
        'No audio was captured. Please try again.',
      )
      this.state = 'error'
      this.recorder = null
      this.chunks = []
      return
    }

    const mimeType =
      this.recorder && this.recorder.mimeType
        ? this.recorder.mimeType
        : 'application/octet-stream'
    const blob = new Blob(this.chunks, { type: mimeType })
    this.result = {
      blob,
      mimeType,
      durationMs: Math.max(0, this.stopTime - this.startTime),
    }
    this.recorder = null
    this.chunks = []
  }

  async startRecording(): Promise<void> {
    if (this.state === 'recording' || this.state === 'requesting-permission') return
    this.reset()

    if (!isRecordingSupported()) {
      this.error = createError(
        'unsupported-browser',
        'Audio recording is not supported in this browser.',
      )
      this.state = 'error'
      throw this.error
    }

    this.state = 'requesting-permission'
    let stream: MediaStream
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    } catch (err) {
      this.stream = null
      this.recorder = null
      this.chunks = []
      this.error = normalizePermissionError(err)
      this.state = 'error'
      throw this.error
    }

    if (!stream || !stream.getAudioTracks || stream.getAudioTracks().length === 0) {
      for (const track of stream ? stream.getTracks() : []) track.stop()
      this.stream = null
      this.error = createError(
        'microphone-unavailable',
        'No microphone was found.',
      )
      this.state = 'error'
      throw this.error
    }

    let recorder: MediaRecorder
    try {
      const mimeType = pickMimeType()
      recorder = mimeType
        ? new MediaRecorder(stream, { mimeType })
        : new MediaRecorder(stream)
    } catch {
      for (const track of stream.getTracks()) track.stop()
      this.stream = null
      this.error = createError(
        'capture-failure',
        'Could not start the recorder.',
      )
      this.state = 'error'
      throw this.error
    }

    this.stream = stream
    this.recorder = recorder
    this.chunks = []
    this.startTime = Date.now()
    this.stopTime = 0
    this.result = null
    this.error = null

    recorder.ondataavailable = this.onDataAvailable
    recorder.onstop = this.onStop
    recorder.onerror = this.onError

    try {
      recorder.start()
    } catch {
      this.error = createError(
        'capture-failure',
        'Could not start the recorder.',
      )
      this.state = 'error'
      this.releaseRecorder()
      throw this.error
    }

    this.state = 'recording'
  }

  stopRecording(): Promise<AudioCaptureResult> {
    return new Promise<AudioCaptureResult>((resolve, reject) => {
      const recorder = this.recorder
      if (!recorder || recorder.state === 'inactive') {
        this.stopTime = Date.now()
        this.releaseRecorder()
        this.state = 'idle'
        const err = createError(
          'stop-failure',
          'There is no active recording to stop.',
        )
        this.error = err
        reject(err)
        return
      }

      if (this.state !== 'recording') {
        const err = createError('stop-failure', 'The recording is not active.')
        this.error = err
        reject(err)
        return
      }

      this.state = 'stopping'

      recorder.onstop = () => {
        this.onStop()
        const result = this.result
        if (result) {
          resolve(result)
        } else {
          const err = this.error ?? createError('empty-recording', 'No audio was captured.')
          reject(err)
        }
      }

      try {
        recorder.stop()
      } catch {
        this.state = 'error'
        this.releaseRecorder()
        const normalized = createError(
          'stop-failure',
          'Stopping the recording failed.',
        )
        this.error = normalized
        reject(normalized)
      }
    })
  }

  cancelRecording(): void {
    const recorder = this.recorder
    if (recorder && recorder.state !== 'inactive') {
      // Detach the stop handler so the async stop event cannot re-enter the
      // finishing/state logic after we have already reset to idle.
      recorder.onstop = null
      try {
        recorder.stop()
      } catch {
        /* cleanup must still proceed */
      }
    }
    this.reset()
  }
}

function normalizePermissionError(err: unknown): AudioCaptureError {
  const name = err && typeof err === 'object' && 'name' in err
    ? String((err as { name?: unknown }).name)
    : ''

  switch (name) {
    case 'NotAllowedError':
    case 'PermissionDeniedError':
    case 'SecurityError':
      return createError(
        'permission-denied',
        'Microphone access was denied. You can still rate your session manually.',
      )
    case 'NotFoundError':
    case 'DevicesNotFoundError':
      return createError(
        'microphone-unavailable',
        'No microphone was found. You can still rate your session manually.',
      )
    case 'NotReadableError':
    case 'TrackStartError':
      return createError(
        'capture-failure',
        'The microphone is in use or unavailable.',
      )
    default:
      return createError(
        'unknown',
        'Could not access the microphone. You can still rate your session manually.',
      )
  }
}

export function formatDuration(ms: number): string {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000))
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}
