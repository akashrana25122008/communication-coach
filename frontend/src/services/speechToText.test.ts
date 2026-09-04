import { describe, expect, it } from 'vitest'
import {
  HttpSpeechToTextService,
  isSpeechToTextError,
  type SpeechToTextError,
  type Transcript,
} from './speechToText'

function makeBlob(text = 'audio-bytes', type = 'audio/webm'): Blob {
  return new Blob([text], { type })
}

interface StubResponseOptions {
  ok?: boolean
  status?: number
  json?: unknown
  jsonRejects?: boolean
}

function stubFetcher(responses: StubResponseOptions[]) {
  const calls: Array<{ url: RequestInfo | URL; init: RequestInit }> = []
  const fetcher = async (
    url: RequestInfo | URL,
    init?: RequestInit,
  ): Promise<Response> => {
    calls.push({ url, init: init ?? {} })
    const done = responses.shift()
    if (!done) {
      throw new TypeError('fetch failed: no queued response')
    }
    if (done.jsonRejects) {
      return {
        ok: done.ok ?? true,
        status: done.status ?? 200,
        json: () => Promise.reject(new SyntaxError('Unexpected token')),
      } as unknown as Response
    }
    return {
      ok: done.ok ?? true,
      status: done.status ?? 200,
      json: () => Promise.resolve(done.json),
    } as unknown as Response
  }
  return { fetcher, calls }
}

function expectSttError(promise: Promise<unknown>): Promise<SpeechToTextError> {
  return promise.then(
    () => {
      throw new Error('expected promise to reject')
    },
    (err) => {
      if (!isSpeechToTextError(err)) {
        throw new Error(`expected SpeechToTextError, got ${String(err)}`)
      }
      return err as SpeechToTextError
    },
  )
}

describe('speechToText', () => {
  it('returns a valid plain transcript', async () => {
    const { fetcher } = stubFetcher([{ json: { text: 'hello world' } }])
    const service = new HttpSpeechToTextService('/api/transcribe', fetcher)
    const transcript = await service.transcribe(makeBlob())
    expect(transcript.text).toBe('hello world')
    expect(transcript.language).toBeUndefined()
    expect(transcript.segments).toBeUndefined()
  })

  it('rejects a zero-byte empty Blob', async () => {
    const { fetcher } = stubFetcher([])
    const service = new HttpSpeechToTextService('/api/transcribe', fetcher)
    const err = await expectSttError(service.transcribe(new Blob([])))
    expect(err.code).toBe('invalid-audio')
  })

  it('rejects a missing audio argument', async () => {
    const { fetcher } = stubFetcher([])
    const service = new HttpSpeechToTextService('/api/transcribe', fetcher)
    // @ts-expect-error exercising the runtime guard for a missing Blob
    const err = await expectSttError(service.transcribe(undefined))
    expect(err.code).toBe('invalid-audio')
  })

  it('rejects on HTTP 4xx', async () => {
    const { fetcher } = stubFetcher([{ ok: false, status: 400, json: {} }])
    const service = new HttpSpeechToTextService('/api/transcribe', fetcher)
    const err = await expectSttError(service.transcribe(makeBlob()))
    expect(err.code).toBe('http-error')
    expect(err.status).toBe(400)
  })

  it('rejects on HTTP 5xx', async () => {
    const { fetcher } = stubFetcher([{ ok: false, status: 502, json: {} }])
    const service = new HttpSpeechToTextService('/api/transcribe', fetcher)
    const err = await expectSttError(service.transcribe(makeBlob()))
    expect(err.code).toBe('http-error')
    expect(err.status).toBe(502)
  })

  it('rejects on network failure', async () => {
    const { fetcher } = stubFetcher([] as StubResponseOptions[])
    const service = new HttpSpeechToTextService('/api/transcribe', fetcher)
    const err = await expectSttError(service.transcribe(makeBlob()))
    expect(err.code).toBe('network-error')
  })

  it('rejects on timeout', async () => {
    const fetcher = (_url: RequestInfo | URL, init?: RequestInit) =>
      new Promise<never>((_resolve, reject) => {
        init?.signal?.addEventListener('abort', () =>
          reject(new DOMException('aborted', 'AbortError')),
        )
      })
    const service = new HttpSpeechToTextService('/api/transcribe', fetcher)
    const err = await expectSttError(
      service.transcribe(makeBlob(), { timeoutMs: 15 }),
    )
    expect(err.code).toBe('timeout')
  })

  it('rejects on malformed JSON', async () => {
    const { fetcher } = stubFetcher([{ jsonRejects: true }])
    const service = new HttpSpeechToTextService('/api/transcribe', fetcher)
    const err = await expectSttError(service.transcribe(makeBlob()))
    expect(err.code).toBe('malformed-response')
  })

  it('rejects when text is missing', async () => {
    const { fetcher } = stubFetcher([{ json: { language: 'en' } }])
    const service = new HttpSpeechToTextService('/api/transcribe', fetcher)
    const err = await expectSttError(service.transcribe(makeBlob()))
    expect(err.code).toBe('malformed-response')
  })

  it('rejects when text is not a string', async () => {
    const { fetcher } = stubFetcher([{ json: { text: 123 } }])
    const service = new HttpSpeechToTextService('/api/transcribe', fetcher)
    const err = await expectSttError(service.transcribe(makeBlob()))
    expect(err.code).toBe('malformed-response')
  })

  it('rejects segments that are not an array', async () => {
    const { fetcher } = stubFetcher([{ json: { text: 'hi', segments: 'nope' } }])
    const service = new HttpSpeechToTextService('/api/transcribe', fetcher)
    const err = await expectSttError(service.transcribe(makeBlob()))
    expect(err.code).toBe('malformed-response')
  })

  it('rejects invalid timestamps (non-numeric)', async () => {
    const { fetcher } = stubFetcher([
      {
        json: {
          text: 'hi',
          segments: [{ startMs: 'bad', endMs: 1000, text: 'hi' }],
        },
      },
    ])
    const service = new HttpSpeechToTextService('/api/transcribe', fetcher)
    const err = await expectSttError(service.transcribe(makeBlob()))
    expect(err.code).toBe('malformed-response')
  })

  it('rejects timestamps where endMs precedes startMs', async () => {
    const { fetcher } = stubFetcher([
      {
        json: {
          text: 'hi',
          segments: [{ startMs: 2000, endMs: 1000, text: 'hi' }],
        },
      },
    ])
    const service = new HttpSpeechToTextService('/api/transcribe', fetcher)
    const err = await expectSttError(service.transcribe(makeBlob()))
    expect(err.code).toBe('malformed-response')
  })

  it('rejects invalid segment text', async () => {
    const { fetcher } = stubFetcher([
      {
        json: {
          text: 'hi',
          segments: [{ startMs: 0, endMs: 1000, text: 42 }],
        },
      },
    ])
    const service = new HttpSpeechToTextService('/api/transcribe', fetcher)
    const err = await expectSttError(service.transcribe(makeBlob()))
    expect(err.code).toBe('malformed-response')
  })

  it('rejects invalid confidence (out of range)', async () => {
    const { fetcher } = stubFetcher([
      {
        json: {
          text: 'hi',
          segments: [
            { startMs: 0, endMs: 1000, text: 'hi', confidence: 1.5 },
          ],
        },
      },
    ])
    const service = new HttpSpeechToTextService('/api/transcribe', fetcher)
    const err = await expectSttError(service.transcribe(makeBlob()))
    expect(err.code).toBe('malformed-response')
  })

  it('accepts an optional language and returns it', async () => {
    const { fetcher } = stubFetcher([{ json: { text: 'hello', language: 'en-US' } }])
    const service = new HttpSpeechToTextService('/api/transcribe', fetcher)
    const transcript = await service.transcribe(makeBlob())
    expect(transcript.language).toBe('en-US')
  })

  it('rejects a whitespace-only empty transcript', async () => {
    const { fetcher } = stubFetcher([{ json: { text: '   ' } }])
    const service = new HttpSpeechToTextService('/api/transcribe', fetcher)
    const err = await expectSttError(service.transcribe(makeBlob()))
    expect(err.code).toBe('empty-transcript')
  })

  it('normalizes a valid segmented transcript', async () => {
    const { fetcher } = stubFetcher([
      {
        json: {
          text: 'one two',
          language: 'en-GB',
          segments: [
            { startMs: 0, endMs: 500, text: 'one', confidence: 0.99 },
            { startMs: 500, endMs: 900, text: 'two' },
          ],
        },
      },
    ])
    const service = new HttpSpeechToTextService('/api/transcribe', fetcher)
    const transcript = (await service.transcribe(makeBlob())) as Transcript
    expect(transcript.text).toBe('one two')
    expect(transcript.language).toBe('en-GB')
    expect(transcript.segments).toHaveLength(2)
    expect(transcript.segments?.[0]).toMatchObject({
      startMs: 0,
      endMs: 500,
      text: 'one',
      confidence: 0.99,
    })
    expect(transcript.segments?.[1].confidence).toBeUndefined()
  })

  it('can retry transcription after a failure using the same blob', async () => {
    const { fetcher } = stubFetcher([
      { ok: false, status: 500, json: {} },
      { json: { text: 'second attempt works' } },
    ])
    const service = new HttpSpeechToTextService('/api/transcribe', fetcher)
    const blob = makeBlob()

    const firstErr = await expectSttError(service.transcribe(blob))
    expect(firstErr.code).toBe('http-error')

    const transcript = await service.transcribe(blob)
    expect(transcript.text).toBe('second attempt works')
  })

  it('does not expose provider-specific fields in the service contract', async () => {
    const { fetcher, calls } = stubFetcher([{ json: { text: 'hello' } }])
    const service = new HttpSpeechToTextService('/api/transcribe', fetcher)
    const transcript = await service.transcribe(makeBlob(), { language: 'en' })

    // Transcript only carries provider-neutral fields.
    const keys = Object.keys(transcript).sort()
    expect(keys).toEqual(['text'])

    // The request reached the expected endpoint as POST with FormData.
    expect(String(calls[0].url)).toBe('/api/transcribe')
    expect(calls[0].init.method).toBe('POST')
    const form = calls[0].init.body as FormData
    const audio = form.get('audio')
    expect(audio instanceof Blob).toBe(true)
    expect((audio as Blob).size).toBeGreaterThan(0)
    expect(form.get('language')).toBe('en')
  })

  it('surfaces backend-unavailable as a graceful typed error', async () => {
    // Simulates the current repo state where backend/ is empty and /api/transcribe
    // is not served. The client must not fake a transcript.
    const fetcher = () => Promise.reject(new TypeError('failed to fetch'))
    const service = new HttpSpeechToTextService('/api/transcribe', fetcher)
    const err = await expectSttError(service.transcribe(makeBlob()))
    expect(err.code).toBe('network-error')
    expect(err.message.length).toBeGreaterThan(0)
  })

  it('respects an endpoint override', async () => {
    const { fetcher, calls } = stubFetcher([{ json: { text: 'ok' } }])
    const service = new HttpSpeechToTextService('/api/transcribe', fetcher)
    await service.transcribe(makeBlob(), { endpoint: 'https://example.com/x' })
    expect(String(calls[0].url)).toBe('https://example.com/x')
  })
})
