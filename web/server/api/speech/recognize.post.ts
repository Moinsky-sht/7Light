// 语音识别 API - 使用火山引擎一句话识别 (SAUC) WebSocket 接口
// 极速版 (Flash ASR) 通常复用此接口或类似协议
// 使用 AK/SK 签名鉴权 (Signature V4)
import { defineEventHandler, readMultipartFormData, createError } from 'h3'
import { v4 as uuidv4 } from 'uuid'
import crypto from 'crypto'
import WebSocket from 'ws'
import { gunzipSync } from 'zlib'

// --- 签名工具函数 ---
function hmac(key: string | Buffer, content: string): Buffer {
    return crypto.createHmac('sha256', key).update(content).digest()
}

function sha256(content: Buffer | string): string {
    return crypto.createHash('sha256').update(content).digest('hex')
}

function getSignatureV4Headers(host: string, path: string, method: string, queryParams: any, ak: string, sk: string, appid: string) {
    const now = new Date()
    const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, '')
    const dateStamp = amzDate.slice(0, 8)
    const service = 'asr'
    const region = 'cn-north-1'

    const q = new URLSearchParams(queryParams)
    q.sort()
    const canonicalQuery = q.toString()
    
    // WebSocket握手请求体为空
    const payloadHash = sha256('')
    
    // Canonical Headers must be lowercase and sorted
    const canonicalHeaders = [
        `host:${host}`,
        `x-api-app-key:${appid}`,
        `x-api-resource-id:volc.asr.sauc`,
        `x-date:${amzDate}`
    ].join('\n')
    
    const signedHeaders = 'host;x-api-app-key;x-api-resource-id;x-date'
    
    const canonicalRequest = [
        method,
        path,
        canonicalQuery,
        canonicalHeaders,
        '',
        signedHeaders,
        payloadHash
    ].join('\n')
    
    const algorithm = 'VOLC-HMAC-SHA256'
    const scope = `${dateStamp}/${region}/${service}/request`
    const stringToSign = [
        algorithm,
        amzDate,
        scope,
        sha256(canonicalRequest)
    ].join('\n')
    
    const kDate = hmac(sk, dateStamp)
    const kRegion = hmac(kDate, region)
    const kService = hmac(kRegion, service)
    const kSigning = hmac(kService, 'request')
    const signature = hmac(kSigning, stringToSign).toString('hex')
    
    const auth = `${algorithm} Credential=${ak}/${scope}, SignedHeaders=${signedHeaders}, Signature=${signature}`
    
    return {
        'Host': host,
        'X-Date': amzDate,
        'X-Api-App-Key': appid,
        'X-Api-Resource-Id': 'volc.asr.sauc',
        'Authorization': auth
    }
}

export default defineEventHandler(async (event) => {
  // 1. 获取配置
  const APPID = process.env.VOLC_APPID
  // 用户提供的 "Access token" 实际上是 Access Key ID (AK)
  const AK = process.env.VOLC_ACCESS_TOKEN 
  const SK = process.env.VOLC_SECRET_KEY
  
  if (!APPID || !AK || !SK) {
    console.error('Missing VOLC credentials')
    throw createError({
      statusCode: 500,
      message: '服务器配置错误：缺少火山引擎鉴权信息'
    })
  }

  // 2. 读取音频
  const formData = await readMultipartFormData(event)
  if (!formData || formData.length === 0) {
    throw createError({ statusCode: 400, message: '请上传音频文件' })
  }
  const audioFile = formData.find(item => item.name === 'audio')
  if (!audioFile || !audioFile.data) {
    throw createError({ statusCode: 400, message: '未找到音频数据' })
  }
  const audioBuffer = audioFile.data
  
  console.log(`[Volc-WS] 准备识别音频, 大小: ${audioBuffer.length} bytes`)

  // 3. WebSocket 连接与识别
  return new Promise((resolve, reject) => {
    const HOST = 'openspeech.bytedance.com'
    const PATH = '/api/v1/sauc'
    const queryParams = { appid: APPID }
    
    const headers = getSignatureV4Headers(HOST, PATH, 'GET', queryParams, AK, SK, APPID)
    const url = `wss://${HOST}${PATH}?` + new URLSearchParams(queryParams).toString()
    
    console.log(`[Volc-WS] Connecting to: ${url}`)
    
    const ws = new WebSocket(url, { 
        headers,
        skipUTF8Validation: true
    })
    
    let resultText = ''
    
    // 超时保护 (10秒)
    const timeout = setTimeout(() => {
        if (ws.readyState === WebSocket.OPEN) ws.close()
        reject(createError({ statusCode: 504, message: '识别超时' }))
    }, 10000)

    ws.on('open', () => {
        console.log('[Volc-WS] Connected')
        
        // 发送 Init Frame
        const initFrame = {
            app: {
                appid: APPID,
                // token: AK, // SigV4 鉴权不需要 token
                cluster: 'volc_auc_common'
            },
            user: { uid: 'user-' + uuidv4() },
            request: {
                reqid: uuidv4(),
                nbest: 1,
                workflow: 'audio_in,resample,partition,vad,fe,decode,itn,nlu_punctuate',
                show_language: false,
                result_type: 'full',
                sequence: 1
            },
            audio: {
                format: 'opus', // 尝试将 webm 声明为 opus
                rate: 16000,
                bits: 16,
                channel: 1,
                codec: 'opus'
            }
        }
        console.log('[Volc-WS] Sending Init Frame:', JSON.stringify(initFrame))
        ws.send(JSON.stringify(initFrame))
        
        // 发送音频数据
        ws.send(audioBuffer)
        
        // 发送结束帧 (Empty Binary)
        ws.send(Buffer.alloc(0))
        console.log('[Volc-WS] Audio sent (total bytes):', audioBuffer.length)
    })

    ws.on('message', (data: any, isBinary: boolean) => {
        let msg
        const buf = Buffer.from(data) // Ensure buffer

        // 1. Try JSON directly
        try {
            msg = JSON.parse(buf.toString())
        } catch (e) {
            // 2. Try finding '{' in raw buffer (Skip custom headers)
            const firstBrace = buf.indexOf(0x7b) // '{'
            if (firstBrace > 0) {
                try {
                    msg = JSON.parse(buf.subarray(firstBrace).toString())
                } catch (ignore) {}
            }

            if (!msg) {
                // 3. Try GZIP
                try {
                    const decompressed = gunzipSync(buf)
                    msg = JSON.parse(decompressed.toString())
                } catch (gzipErr) {
                     // 4. Try finding '{' in decompressed
                     // ...
                }
            }
        }

        if (!msg) {
            console.error('[Volc-WS] Failed to parse message. Hex:', buf.subarray(0, 50).toString('hex'))
            return
        }
        
        console.log('[Volc-WS] Msg:', JSON.stringify(msg))
            
        if (msg.code !== 1000) {
            console.error('[Volc-WS] Error Msg:', msg)
            if (msg.code >= 3000) {
                ws.close()
                reject(createError({ statusCode: 502, message: `识别错误: ${msg.message} (${msg.code})` }))
            }
            return
        }
        
        if (msg.result && msg.result.length > 0) {
            // 更新结果
            resultText = msg.result[0].text
        }
    })

    ws.on('close', (code: number, reason: Buffer) => {
        clearTimeout(timeout)
        console.log(`[Volc-WS] Closed: ${code} ${reason}`)
        
        if (resultText) {
            resolve({
                success: true,
                text: resultText.trim()
            })
        } else {
            // 如果关闭时没有结果，且不是正常关闭
            if (code !== 1000) {
                 reject(createError({ statusCode: 502, message: '连接意外关闭，未获取到结果' }))
            } else {
                 resolve({ success: true, text: '' })
            }
        }
    })

    ws.on('error', (err: Error) => {
        clearTimeout(timeout)
        console.error('[Volc-WS] Error:', err)
        reject(createError({ statusCode: 502, message: 'WebSocket 连接错误' }))
    })
  })
})
