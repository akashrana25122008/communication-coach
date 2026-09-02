import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  AudioCaptureController,
  formatDuration,
} from './audioCapture'

interface FakeTrack {
  stop: ReturnType<typeof vi.fn>
}

class FakeMediaStream {
  tracks: FakeTrack[] = []

  constructor(withAudio = true) {
    if (withAudio) this.tracks.push({ stop: vi.fn() })
  }
  getAudioTracks(): FakeTrack[] {
    return this.tracks
  }
  getTracks(): FakeTrack[] {
    return this.tracks
  }
}

class FakeMediaRecorder {
  static isTypeSupported = vi.fn((type: string) =>
    type.includes('audio/webm'),
  )
  static instances: FakeMediaRecorder[] = []
  static produceData = true
  stream: MediaStream
  options?: MediaRecorderOptions
  state: RecordingState = 'inactive'
  mimeType = 'audio/webm;codecs=opus'
  ondataavailable: ((event: BlobEvent) => void) | null = null
  onstop: (() => void) | null = null
  onerror: (() => void) | null = null
  startCalls = 0
  stopCalls = 0
  chunks: Blob[] = []

  constructor(stream: MediaStream, options?: MediaRecorderOptions) {
    this.stream = stream
    this.options = options
    FakeMediaRecorder.instances.push(this)
  }

  start(): void {
    this.startCalls += 1
    this.state = 'recording'
  }

  stop(): void {
    this.stopCalls += 1
    this.state = 'inactive'
    if (FakeMediaRecorder.produceData) {
      const chunk = new Blob(['audio-data'], { type: this.mimeType })
      this.chunks.push(chunk)
      if (this.ondataavailable) {
        const event = { data: chunk } as unknown as BlobEvent
        this.ondataavailable(event)
      }
    }
    if (this.onstop) this.onstop()
  }

  pause(): void {
    this.state = 'paused'
  }
  resume(): void {
    this.state = 'recording'
  }
  requestData(): void {
    /* noop */
  }
}

const realMediaRecorder = globalThis.MediaRecorder

function installFakeMp3(): void {
  // Make MediaRecorder.isTypeSupported also accept audio/mp4 for MIME tests
  FakeMediaRecorder.isTypeSupported = vi.fn(
    (type: string) => type === 'audio/webm;codecs=opus' || type === 'audio/mp4',
  )
}

beforeEach(() => {
  FakeMediaRecorder.instances = []
  FakeMediaRecorder.produceData = true
  FakeMediaRecorder.isTypeSupported = vi.fn((type: string) =>
    type.includes('audio/webm'),
  )
  ;(globalThis as Record<string, unknown>).MediaRecorder = FakeMediaRecorder
  Object.defineProperty(navigator, 'mediaDevices', {
    configurable: true,
    value: {
      getUserMedia: vi.fn().mockResolvedValue(new FakeMediaStream(true)),
    },
  })
})

afterEach(() => {
  if (realMediaRecorder === undefined) {
    delete (globalThis as Record<string, unknown>).MediaRecorder
  } else {
    ;(globalThis as Record<string, unknown>).MediaRecorder = realMediaRecorder
  }
  vi.restoreAllMocks()
})

describe('AudioCaptureController', () => {
  it('starts in idle state', () => {
    const controller = new AudioCaptureController()
    expect(controller.getState()).toBe('idle')
    expect(controller.getResult()).toBeNull()
    expect(controller.getError()).toBeNull()
  })

  it('reports unsupported browser when APIs are missing', async () => {
    Object.defineProperty(navigator, 'mediaDevices', {
      configurable: true,
      value: undefined,
    })
    delete (globalThis as Record<string, unknown>).MediaRecorder
    const controller = new AudioCaptureController()
    await expect(controller.startRecording()).rejects.toMatchObject({
      code: 'unsupported-browser',
    })
    expect(controller.getState()).toBe('error')
  })

  it('requests audio-only permission', async () => {
    const getUserMedia = navigator.mediaDevices.getUserMedia as ReturnType<typeof vi.fn>
    const controller = new AudioCaptureController()
    await controller.startRecording()
    expect(getUserMedia).toHaveBeenCalledWith({ audio: true })
  })

  it('normalizes permission denied', async () => {
    const getUserMedia = navigator.mediaDevices.getUserMedia as ReturnType<typeof vi.fn>
    getUserMedia.mockRejectedValueOnce({ name: 'NotAllowedError' })
    const controller = new AudioCaptureController()
    await expect(controller.startRecording()).rejects.toMatchObject({
      code: 'permission-denied',
    })
    expect(controller.getState()).toBe('error')
  })

  it('reaches recording state after successful getUserMedia', async () => {
    const controller = new AudioCaptureController()
    await controller.startRecording()
    expect(controller.getState()).toBe('recording')
    expect(FakeMediaRecorder.instances).toHaveLength(1)
  })

  it('selects a supported MIME type for the recorder', async () => {
    installFakeMp3()
    const controller = new AudioCaptureController()
    await controller.startRecording()
    const recorder = FakeMediaRecorder.instances[0]
    expect(recorder.options?.mimeType).toBe('audio/webm;codecs=opus')
    expect(recorder.mimeType).toBe('audio/webm;codecs=opus')
  })

  it('records a Blob after the stop lifecycle', async () => {
    const controller = new AudioCaptureController()
    await controller.startRecording()
    const result = await controller.stopRecording()
    expect(result.blob).toBeInstanceOf(Blob)
    expect(result.mimeType).toContain('audio')
    expect(result.durationMs).toBeGreaterThanOrEqual(0)
    expect(controller.getState()).toBe('completed')
    expect(controller.hasRecording()).toBe(true)
  })

  it('calculates a non-negative duration', async () => {
    const controller = new AudioCaptureController()
    await controller.startRecording()
    await controller.stopRecording()
    expect(controller.getDuration()).toBeGreaterThanOrEqual(0)
  })

  it('stops all tracks after recording completes', async () => {
    const controller = new AudioCaptureController()
    await controller.startRecording()
    const recorder = FakeMediaRecorder.instances[0]
    const tracks = recorder.stream as unknown as FakeMediaStream
    await controller.stopRecording()
    for (const track of tracks.getTracks()) {
      expect(track.stop).toHaveBeenCalled()
    }
  })

  it('cancel cleans up and resets to idle', async () => {
    const controller = new AudioCaptureController()
    await controller.startRecording()
    controller.cancelRecording()
    expect(controller.getState()).toBe('idle')
    expect(controller.getResult()).toBeNull()
    expect(controller.hasRecording()).toBe(false)
  })

  it('supports repeated start/stop cycles', async () => {
    const controller = new AudioCaptureController()
    await controller.startRecording()
    await controller.stopRecording()
    expect(controller.getState()).toBe('completed')

    await controller.startRecording()
    expect(controller.getState()).toBe('recording')
    await controller.stopRecording()
    expect(controller.getState()).toBe('completed')
  })

  it('leaves the controller recoverable after a failed start', async () => {
    const getUserMedia = navigator.mediaDevices.getUserMedia as ReturnType<typeof vi.fn>
    getUserMedia.mockRejectedValueOnce({ name: 'NotFoundError' })
    const controller = new AudioCaptureController()
    await expect(controller.startRecording()).rejects.toMatchObject({
      code: 'microphone-unavailable',
    })
    expect(controller.getState()).toBe('error')
    expect(controller.getResult()).toBeNull()

    getUserMedia.mockResolvedValueOnce(new FakeMediaStream(true))
    await controller.startRecording()
    expect(controller.getState()).toBe('recording')
  })

  it('handles an empty recording with a typed error', async () => {
    FakeMediaRecorder.produceData = false
    const controller = new AudioCaptureController()
    await controller.startRecording()
    await expect(controller.stopRecording()).rejects.toMatchObject({
      code: 'empty-recording',
    })
    expect(controller.getResult()).toBeNull()
    expect(controller.getError()?.code).toBe('empty-recording')
  })

  it('normalizes a stream with no audio tracks', async () => {
    const getUserMedia = navigator.mediaDevices.getUserMedia as ReturnType<typeof vi.fn>
    getUserMedia.mockResolvedValueOnce(new FakeMediaStream(false))
    const controller = new AudioCaptureController()
    await expect(controller.startRecording()).rejects.toMatchObject({
      code: 'microphone-unavailable',
    })
  })
})

describe('formatDuration', () => {
  it('formats milliseconds as m:ss', () => {
    expect(formatDuration(0)).toBe('0:00')
    expect(formatDuration(65_000)).toBe('1:05')
    expect(formatDuration(125_000)).toBe('2:05')
    expect(formatDuration(-5)).toBe('0:00')
  })
})
