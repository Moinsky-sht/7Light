import { defineWebSocketHandler } from 'h3'
import WebSocket from 'ws'
import crypto from 'crypto'
import { gunzipSync, gzipSync } from 'zlib'

const PROTOCOL_VERSION = 0b0001
const DEFAULT_HEADER_SIZE = 0b0001

function connectVolcWS(params: {
  appid: string
  accessKey: string
  resourceId: string
}) {
  const host = 'openspeech.bytedance.com'
  const path = process.env.VOLC_WS_PATH || '/api/v3/sauc/bigmodel'
  const url = `wss://${host}${path}`

  return new Promise<{ volc: WebSocket; url: string; path: string }>((resolve, reject) => {
    const connectId = crypto.randomUUID()
    const reqid = crypto.randomUUID()
    const headers = {
      'X-Api-App-Key': params.appid,
      'X-Api-Access-Key': params.accessKey,
      'X-Api-Resource-Id': params.resourceId,
      'X-Api-Connect-Id': connectId,
      'X-Api-Request-Id': reqid
    }
    const ws = new WebSocket(url, {
      headers,
      skipUTF8Validation: true
    })

    ws.once('open', () => resolve({ volc: ws, url, path }))
    ws.once('error', (e) => reject(e))
    ws.once('unexpected-response', (_req, res) => {
      let body = ''
      res.on('data', (c) => (body += c))
      res.on('end', () => {
        reject(new Error(`Volc WS unexpected response: ${res.statusCode} ${body}`))
      })
    })
  })
}

type VolcFrame = {
  version: number
  headerSize: number
  messageType: number
  flags: number
  serialization: number
  compression: number
  sequence?: number
  payload: Buffer
}

function packVolcFrame(input: {
  messageType: number
  flags?: number
  serialization: number
  compression: number
  sequence?: number
  payload?: Buffer
}) {
  const flags = input.flags ?? 0
  const header = Buffer.alloc(4)
  header[0] = (PROTOCOL_VERSION << 4) | DEFAULT_HEADER_SIZE
  header[1] = (input.messageType << 4) | flags
  header[2] = (input.serialization << 4) | input.compression
  header[3] = 0x00
  const hasSequence = typeof input.sequence === 'number'
  const seqBuf = hasSequence ? Buffer.alloc(4) : null
  if (seqBuf) seqBuf.writeInt32BE(input.sequence as number, 0)

  const rawPayload = input.payload ?? Buffer.alloc(0)
  const payloadSize = Buffer.alloc(4)
  payloadSize.writeUInt32BE(rawPayload.length, 0)

  if (rawPayload.length === 0) {
    return Buffer.concat(seqBuf ? [header, seqBuf, payloadSize] : [header, payloadSize])
  }

  return Buffer.concat(seqBuf ? [header, seqBuf, payloadSize, rawPayload] : [header, payloadSize, rawPayload])
}

function parseVolcFrame(data: Buffer): VolcFrame | null {
  if (!data || data.length < 8) return null
  const version = data[0] >> 4
  const headerSize = data[0] & 0x0f
  const headerBytes = headerSize * 4
  if (data.length < headerBytes + 4) return null

  const messageType = data[1] >> 4
  const flags = data[1] & 0x0f
  const serialization = data[2] >> 4
  const compression = data[2] & 0x0f

  const maxPayload = 10 * 1024 * 1024
  const candidates: Array<{ seq?: number; sizeOffset: number; payloadOffset: number }> = [
    { sizeOffset: headerBytes, payloadOffset: headerBytes + 4 },
    { seq: data.length >= headerBytes + 4 ? data.readInt32BE(headerBytes) : undefined, sizeOffset: headerBytes + 4, payloadOffset: headerBytes + 8 },
    { sizeOffset: headerBytes + 4, payloadOffset: headerBytes + 8 },
    { seq: data.length >= headerBytes + 4 ? data.readInt32BE(headerBytes) : undefined, sizeOffset: headerBytes + 8, payloadOffset: headerBytes + 12 }
  ]

  let chosen: { seq?: number; payloadStart: number; payloadEnd: number; payloadSize: number } | null = null

  for (const c of candidates) {
    if (data.length < c.payloadOffset) continue
    if (data.length < c.sizeOffset + 4) continue
    const payloadSize = data.readUInt32BE(c.sizeOffset)
    if (payloadSize > maxPayload) continue
    const payloadStart = c.payloadOffset
    const payloadEnd = payloadStart + payloadSize
    if (payloadEnd > data.length) continue
    chosen = { seq: c.seq, payloadStart, payloadEnd, payloadSize }
    break
  }

  if (!chosen) {
    return null
  }

  let payload = data.subarray(chosen.payloadStart, chosen.payloadEnd)
  if (compression === 0b0001) {
    try {
      payload = gunzipSync(payload)
    } catch {
      return null
    }
  }

  return {
    version,
    headerSize,
    messageType,
    flags,
    serialization,
    compression,
    sequence: chosen.seq,
    payload
  }
}

function tryParseVolcJSONFromFrame(frame: VolcFrame) {
  if (frame.serialization !== 0b0001) return null
  try {
    return JSON.parse(frame.payload.toString())
  } catch {
    return null
  }
}

function tryParseAnyJSONFromBuffer(buf: Buffer) {
  const firstBrace = buf.indexOf(0x7b)
  if (firstBrace >= 0) {
    try {
      return JSON.parse(buf.subarray(firstBrace).toString())
    } catch {}
  }

  for (let i = 0; i < Math.min(buf.length - 2, 96); i++) {
    if (buf[i] === 0x1f && buf[i + 1] === 0x8b) {
      try {
        const unzipped = gunzipSync(buf.subarray(i))
        const brace = unzipped.indexOf(0x7b)
        if (brace >= 0) return JSON.parse(unzipped.subarray(brace).toString())
      } catch {}
    }
  }

  return null
}

export default defineWebSocketHandler({
  async open(peer) {
    try {
      const appid = process.env.VOLC_APPID
      const accessKey = process.env.VOLC_ACCESS_TOKEN
      const resourceId = process.env.VOLC_RESOURCE_ID || 'volc.bigasr.sauc.duration'
      const cluster = process.env.VOLC_CLUSTER || 'volc_auc_common'

      console.log('[SpeechWS] open', { resourceId, cluster })

      if (!appid || !accessKey) {
        peer.send(JSON.stringify({ type: 'error', message: '服务器配置错误：缺少火山引擎鉴权信息' }))
        peer.close()
        return
      }

      const { volc, url, path } = await connectVolcWS({
        appid,
        accessKey,
        resourceId
      })

      ;(peer as any).volc = volc
      ;(peer as any).volcReady = true
      ;(peer as any).closed = false
      ;(peer as any).audioSeq = 2

      peer.send(JSON.stringify({ type: 'ready', upstream: { url, path } }))

      const initFrame = {
        app: {
          appid,
          cluster,
          token: accessKey
        },
        user: { uid: `web-${crypto.randomUUID()}` },
        request: {
          reqid: crypto.randomUUID(),
          workflow: 'audio_in,resample,partition,vad,fe,decode,itn,nlu_punctuate',
          nbest: 1,
          show_language: false,
          show_utterances: false,
          enable_itn: false,
          enable_punc: false,
          performance_mode: true,
          log_text_change_only: true,
          end_window_size: 800,
          force_to_speech_time: 100,
          result_type: 'full',
          sequence: 1
        },
        audio: {
          format: 'pcm',
          rate: 16000,
          bits: 16,
          channel: 1,
          codec: 'raw'
        }
      }

      const initPayload = gzipSync(Buffer.from(JSON.stringify(initFrame)))
      volc.send(
        packVolcFrame({
          messageType: 0b0001,
          flags: 0b0001,
          serialization: 0b0001,
          compression: 0b0001,
          sequence: 1,
          payload: initPayload
        })
      )
      peer.send(JSON.stringify({ type: 'upstream_open' }))

      volc.on('message', (data: any) => {
        const buf = Buffer.isBuffer(data) ? data : Buffer.from(data)
        const frame = parseVolcFrame(buf)
        if (!frame) {
          const json = tryParseAnyJSONFromBuffer(buf)
          if (json) {
            const text =
              json?.result?.[0]?.text ||
              json?.payload?.result?.[0]?.text ||
              json?.data?.result?.[0]?.text ||
              json?.body?.result?.text ||
              json?.text ||
              json?.result?.text

            if (typeof text === 'string' && text.trim()) {
              const lastText = (peer as any).lastText
              if (lastText !== text) {
                ;(peer as any).lastText = text
                peer.send(JSON.stringify({ type: 'partial', text }))
              }
            }
            return
          }
          peer.send(
            JSON.stringify({
              type: 'upstream_raw',
              len: buf.length,
              hex: buf.subarray(0, 64).toString('hex')
            })
          )
          return
        }

        const json = tryParseVolcJSONFromFrame(frame)
        if (frame.messageType === 0b1111) {
          peer.send(JSON.stringify({ type: 'error', message: json?.message || '识别失败', detail: json || frame }))
          return
        }

        if (!json) {
          const anyJson = tryParseAnyJSONFromBuffer(buf)
          if (anyJson) {
            const text =
              anyJson?.result?.[0]?.text ||
              anyJson?.payload?.result?.[0]?.text ||
              anyJson?.data?.result?.[0]?.text ||
              anyJson?.body?.result?.text ||
              anyJson?.text ||
              anyJson?.result?.text

            if (typeof text === 'string' && text.trim()) {
              const lastText = (peer as any).lastText
              if (lastText !== text) {
                ;(peer as any).lastText = text
                peer.send(JSON.stringify({ type: 'partial', text }))
              }
            }
          }
          return
        }

        const text =
          json?.result?.[0]?.text ||
          json?.payload?.result?.[0]?.text ||
          json?.data?.result?.[0]?.text ||
          json?.body?.result?.text ||
          json?.text ||
          json?.result?.text

        if (typeof text === 'string' && text.trim()) {
          const lastText = (peer as any).lastText
          if (lastText !== text) {
            ;(peer as any).lastText = text
            peer.send(JSON.stringify({ type: 'partial', text }))
          }
        }
      })

      volc.on('close', (code: number, reason: Buffer) => {
        const reasonText = reason?.toString?.() || ''
        console.log('[SpeechWS] upstream close', code, reasonText)
        if ((peer as any).closed) return
        peer.send(JSON.stringify({ type: 'upstream_close', code, reason: reasonText }))
        peer.close()
      })

      volc.on('error', (err: any) => {
        console.error('[SpeechWS] upstream error', err?.message || err)
        if ((peer as any).closed) return
        peer.send(JSON.stringify({ type: 'error', message: err?.message || '上游连接错误' }))
        peer.close()
      })
    } catch (err: any) {
      console.error('[SpeechWS] open failed', err?.message || err)
      try {
        peer.send(JSON.stringify({ type: 'error', message: err?.message || '连接识别服务失败' }))
      } catch {}
      try {
        peer.close()
      } catch {}
    }
  },
  message(peer, message) {
    const volc: WebSocket | undefined = (peer as any).volc
    const volcReady: boolean = (peer as any).volcReady
    if (!volc) return

    const raw = (message as any).rawData
    const isText = typeof raw === 'string'
    if (!isText) {
      if (!volcReady) return
      const u8 = (message as any).uint8Array ? (message as any).uint8Array() : null
      if (u8 && u8.byteLength > 0) {
        const seq = ((peer as any).audioSeq as number | undefined) ?? 1
        ;(peer as any).audioSeq = seq + 1
        const payload = gzipSync(Buffer.from(u8))
        volc.send(
          packVolcFrame({
            messageType: 0b0010,
            flags: 0b0001,
            serialization: 0b0000,
            compression: 0b0001,
            sequence: seq,
            payload
          })
        )
      }
      return
    }

    const text = (message as any).text ? (message as any).text() : String(raw)
    if (!text) return
    let msg: any
    try {
      msg = JSON.parse(text)
    } catch {
      return
    }

    if (msg?.type === 'end') {
      if (volcReady) {
        const seq = ((peer as any).audioSeq as number | undefined) ?? 1
        ;(peer as any).audioSeq = seq + 1
        volc.send(
          packVolcFrame({
            messageType: 0b0010,
            flags: 0b0011,
            serialization: 0b0000,
            compression: 0b0001,
            sequence: -seq,
            payload: Buffer.alloc(0)
          })
        )
      }
      volc.close()
      setTimeout(() => {
        try {
          peer.close()
        } catch {}
      }, 2000)
      return
    }
  },
  close(peer) {
    ;(peer as any).closed = true
    const volc: WebSocket | undefined = (peer as any).volc
    if (volc && volc.readyState === WebSocket.OPEN) {
      const seq = ((peer as any).audioSeq as number | undefined) ?? 1
      volc.send(
        packVolcFrame({
          messageType: 0b0010,
          flags: 0b0011,
          serialization: 0b0000,
          compression: 0b0001,
          sequence: -seq,
          payload: Buffer.alloc(0)
        })
      )
      volc.close()
    } else if (volc) {
      try {
        volc.terminate()
      } catch {}
    }
  },
  error(peer, error) {
    const volc: WebSocket | undefined = (peer as any).volc
    if (volc) {
      try {
        volc.terminate()
      } catch {}
    }
    try {
      peer.send(JSON.stringify({ type: 'error', message: (error as any)?.message || 'WebSocket 错误' }))
    } catch {}
  }
})
