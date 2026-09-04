/**
 * M5B — Speech-to-Text (STT) Foundation.
 *
 * A small, dependency-free, provider-independent STT abstraction.
 *
 * Architecture:
 *
 *   Audio Blob (produced by M5A AudioCaptureController)
 *        ↓
 *   SpeechToTextService.transcribe(blob, options)
 *        ↓
 *   POST /api/transcribe        (backend boundary)
 *        ↓
 *   normalized Transcript       (canonical, provider-neutral)
 *
 * Frontend policy:
 *  - No STT credentials, provider API keys, or provider SDKs live here. Keys
 *    belong only on the backend (see the repo's git-ignored root .env).
 *  - The client never talks to a third-party STT provider directly. It posts
 *    the audio Blob to the app's own /api/transcribe endpoint and expects a
 *    normalized Transcript in return.
 *  - No backend exists yet in this repository (backend/ is an empty
 *    placeholder). Until that endpoint is implemented, transcription will fail
 *    with a typed, user-friendly error — the UI must never claim transcription
 *    succeeded when no real STT service was used.
 *
 * Lifetime:
 *  - The audio Blob and the returned Transcript are in-memory only. Nothing
 *    here persists, stores to localStorage, or uploads anywhere other than the
 *    configured transcription endpoint.
 *  - Transcript persistence is M5C (not implemented). AI analysis is M5D (not
 *    implemented). This module only converts speech to a Transcript.
 */

// ---------------------------------------------------------------------------
// Canonical, provider-neutral transcript model
// ---------------------------------------------------------------------------

export interface TranscriptSegment {
  /** Start offset in milliseconds. */
  startMs: number
  /** End offset in milliseconds. Must be >= startMs. */
  endMs: number
  text: string
  /** Optional confidence in the [0, 1] range. */
  confidence?: number
}

export interface Transcript {
  text: string
  /** Optional BCP-47 language tag, e.g. "en-US". */
  language?: string
  /** Optional timed segments. */
  segments?: TranscriptSegment[]
}

// ---------------------------------------------------------------------------
// Provider-neutral options
// ---------------------------------------------------------------------------

export interface SpeechToTextOptions {
  /** Optional BCP-47 language hint forwarded to the backend. */
  language?: string
  /** Optional request timeout in ms (default 30_000). */
  timeoutMs?: number
  /** Allow the caller to abort the request. */
  signal?: AbortSignal
  /** Override the transcription endpoint (default '/api/transcribe'). */
  endpoint?: string
}

// ---------------------------------------------------------------------------
// Normalized, typed STT errors
// ---------------------------------------------------------------------------

export type SpeechToTextErrorCode =
  | 'invalid-audio'
  | 'unsupported'
  | 'network-error'
  | 'http-error'
  | 'timeout'
  | 'malformed-response'
  | 'empty-transcript'
  | 'transcription-failed'
  | 'unknown'

export interface SpeechToTextError {
  code: SpeechToTextErrorCode
  /** User-facing message. Never contains secrets or raw provider detail. */
  message: string
  /** HTTP status for http-error; used for diagnostics only, never exposed. */
  status?: number
  /** Original cause for developer diagnostics; never rendered to the user. */
  cause?: unknown
}

function createError(
  code: SpeechToTextErrorCode,
  message: string,
  extra?: Partial<SpeechToTextError>,
): SpeechToTextError {
  return { code, message, ...extra }
}

function isSpeechToTextError(value: unknown): value is SpeechToTextError {
  return Boolean(
    value &&
      typeof value === 'object' &&
      'code' in value &&
      'message' in value &&
      typeof (value as { message?: unknown }).message === 'string',
  )
}

// ---------------------------------------------------------------------------
// Provider-independent abstraction
// ---------------------------------------------------------------------------

export interface SpeechToTextService {
  transcribe(audio: Blob, options?: SpeechToTextOptions): Promise<Transcript>
}

// ---------------------------------------------------------------------------
// Response validation (backend data is treated as untrusted)
// ---------------------------------------------------------------------------

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value)
}

function parseSegment(raw: unknown): TranscriptSegment | null {
  if (!isRecord(raw)) return null
  if (typeof raw.text !== 'string') return null
  if (!isFiniteNumber(raw.startMs) || raw.startMs < 0) return null
  if (!isFiniteNumber(raw.endMs) || raw.endMs < raw.startMs) return null
  let confidence: number | undefined
  if (raw.confidence !== undefined) {
    if (!isFiniteNumber(raw.confidence) || raw.confidence < 0 || raw.confidence > 1) {
      return null
    }
    confidence = raw.confidence
  }
  return {
    startMs: raw.startMs,
    endMs: raw.endMs,
    text: raw.text,
    ...(confidence !== undefined ? { confidence } : {}),
  }
}

/**
 * Validates a raw backend payload into a Transcript. Returns null when the
 * payload is malformed. Does not strip whitespace that determines "empty"
 * — callers distinguish empty-text separately.
 */
function parseTranscript(raw: unknown): Transcript | null {
  if (!isRecord(raw)) return null
  if (typeof raw.text !== 'string') return null

  if (raw.language !== undefined && typeof raw.language !== 'string') return null

  let segments: TranscriptSegment[] | undefined
  if (raw.segments !== undefined) {
    if (!Array.isArray(raw.segments)) return null
    const parsed: TranscriptSegment[] = []
    for (const seg of raw.segments) {
      const segment = parseSegment(seg)
      if (!segment) return null
      parsed.push(segment)
    }
    segments = parsed
  }

  return {
    text: raw.text,
    ...(raw.language !== undefined ? { language: raw.language } : {}),
    ...(segments !== undefined ? { segments } : {}),
  }
}

// ---------------------------------------------------------------------------
// HTTP client (frontend boundary to /api/transcribe)
// ---------------------------------------------------------------------------

const DEFAULT_ENDPOINT = '/api/transcribe'
const DEFAULT_TIMEOUT_MS = 30_000

const MIME_EXTENSIONS: Record<string, string> = {
  'audio/webm': 'webm',
  'audio/webm;codecs=opus': 'webm',
  'audio/mp4': 'm4a',
  'audio/ogg': 'ogg',
  'audio/wav': 'wav',
}

function extensionFor(type: string): string {
  const normalized = type.split(';')[0].trim().toLowerCase()
  return MIME_EXTENSIONS[normalized] ?? 'bin'
}

export class HttpSpeechToTextService implements SpeechToTextService {
  private readonly endpoint: string
  private readonly fetcher: typeof fetch

  constructor(endpoint: string = DEFAULT_ENDPOINT, fetcher?: typeof fetch) {
    this.endpoint = endpoint
    this.fetcher = fetcher ?? globalThis.fetch.bind(globalThis)
  }

  async transcribe(audio: Blob, options: SpeechToTextOptions = {}): Promise<Transcript> {
    if (!audio) {
      throw createError('invalid-audio', 'No recorded audio is available to transcribe.')
    }
    if (audio.size === 0) {
      throw createError('invalid-audio', 'The recorded audio is empty.')
    }
    if (typeof FormData === 'undefined' || typeof this.fetcher !== 'function') {
      throw createError('unsupported', 'Speech-to-text is not supported in this browser.')
    }

    const endpoint = options.endpoint ?? this.endpoint
    const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS

    const form = new FormData()
    form.append('audio', audio, `recording.${extensionFor(audio.type)}`)
    if (options.language) form.append('language', options.language)

    const controller = new AbortController()
    const onExternalAbort = () => controller.abort()
    if (options.signal?.aborted) {
      throw createError('unknown', 'Transcription was cancelled.')
    }
    options.signal?.addEventListener('abort', onExternalAbort, { once: true })

    const timer =
      timeoutMs > 0 ? setTimeout(() => controller.abort(), timeoutMs) : undefined

    let response: Response
    try {
      response = await this.fetcher(endpoint, {
        method: 'POST',
        body: form,
        signal: controller.signal,
      })
    } catch (err) {
      if (controller.signal.aborted) {
        throw createError(
          'timeout',
          'Transcription timed out. Please try again.',
          { cause: err },
        )
      }
      throw createError(
        'network-error',
        'Could not reach the transcription service. Check your connection and try again.',
        { cause: err },
      )
    } finally {
      if (timer !== undefined) clearTimeout(timer)
      options.signal?.removeEventListener('abort', onExternalAbort)
    }

    if (!response.ok) {
      throw createError(
        'http-error',
        `Transcription failed. The service returned an error (${response.status}).`,
        { status: response.status },
      )
    }

    let payload: unknown
    try {
      payload = await response.json()
    } catch (err) {
      throw createError(
        'malformed-response',
        'Transcription returned an unreadable response.',
        { cause: err },
      )
    }

    const transcript = parseTranscript(payload)
    if (!transcript) {
      throw createError(
        'malformed-response',
        'Transcription returned an unexpected response.',
      )
    }
    if (transcript.text.trim().length === 0) {
      throw createError('empty-transcript', 'No speech was recognised in the recording.')
    }

    return transcript
  }
}

/** Shared singleton used by the UI. */
export const speechToTextService: SpeechToTextService = new HttpSpeechToTextService()

export { isSpeechToTextError }
