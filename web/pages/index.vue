<template>
  <div class="checkin-page">
    <!-- 背景层 -->
    <div class="page-background">
      <div class="paper-texture"></div>
      <div class="ink-wash ink-1"></div>
      <div class="ink-wash ink-2"></div>
      <div class="falling-petals">
        <div v-for="n in 15" :key="'petal-'+n" 
          class="petal"
          :style="{
            left: ((n * 7) % 100) + '%',
            animationDelay: ((n * 0.7) % 10) + 's',
            animationDuration: (8 + (n % 5)) + 's'
          }"
        ></div>
      </div>
    </div>

    <!-- 顶部数据区 -->
    <header class="page-header">
      <div class="stat-card left">
        <span class="stat-label">累计续命</span>
        <div class="stat-value-group">
          <span class="stat-number">{{ userStore.lifeDays }}</span>
          <span class="stat-unit">天</span>
        </div>
      </div>
      
      <div class="title-area">
        <h1 class="main-title">命续 · 七星灯</h1>
        <p class="sub-title">点亮星灯·日日续生</p>
      </div>
      
      <div class="stat-card right">
        <span class="stat-label">今日亮灯</span>
        <div class="stat-value-group">
          <span class="stat-number highlight">{{ lampsLit }}</span>
          <span class="stat-unit">盏</span>
        </div>
      </div>
    </header>

    <!-- 主灯区域 -->
    <section class="main-lamp-section">
      <div class="lamp-glow-bg" :class="{ 'is-lit': checkinStore.brightness > 0 }"></div>
      <div class="lamp-container" :class="{ 'is-lit': checkinStore.brightness > 0 }">
        <CupLamp :brightness="checkinStore.brightness" />
      </div>
      
      <div class="progress-indicator">
        <!-- 合并后的带节点进度条 -->
        <div class="stepped-progress">
          <!-- 进度背景线 -->
          <div class="progress-line-bg"></div>
          <!-- 进度填充线 -->
          <div class="progress-line-fill" :style="{ width: (checkinStore.todayAnswered / 10) * 100 + '%' }"></div>
          
          <!-- 节点 -->
          <div class="progress-steps">
            <div 
              v-for="n in 10" 
              :key="n"
              class="step-dot"
              :class="{ 
                'active': n <= checkinStore.todayAnswered,
                'current': n === checkinStore.todayAnswered + 1
              }"
            >
              <div class="dot-inner"></div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 问答卡片区 -->
    <section class="question-section" style="margin-top: 30px;">
      <div class="question-card" :class="{ 'has-reply': aiReply }">
        <div class="card-header">
          <div class="header-left">
            <span class="card-badge">今日功课</span>
            <span class="question-count">第 {{ checkinStore.todayAnswered + 1 }}/10 问</span>
            <div class="source-info-wrapper">
              <button class="info-btn" @click.stop="toggleSourceTooltip">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
                  <line x1="12" y1="17" x2="12.01" y2="17"></line>
                </svg>
              </button>
              <transition name="fade">
                <div v-if="showSourceTooltip" class="source-tooltip">
                  每日问题来自您的基础信息、过往问答、健康维度
                </div>
              </transition>
            </div>
          </div>
          <button 
            class="refresh-btn" 
            @click="handleChangeQuestion"
            :disabled="checkinStore.isLoading || checkinStore.changeCount >= 20"
          >
            <svg class="refresh-icon" :class="{ 'spinning': checkinStore.isLoading }" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M23 4v6h-6"/>
              <path d="M1 20v-6h6"/>
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
            </svg>
            <span>换题</span>
          </button>
        </div>

        <transition name="fade-slide">
          <div v-if="aiReply" class="ai-reply-area">
            <div class="reply-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="#A83232">
                <path d="M12 0L14.59 8.41L23 11L14.59 13.59L12 22L9.41 13.59L1 11L9.41 8.41L12 0Z"/>
              </svg>
            </div>
            <p class="reply-text">"{{ aiReply }}"</p>
          </div>
        </transition>

        <div class="question-area">
          <div class="question-icon">问</div>
          <transition name="fade" mode="out-in">
            <p class="question-text" :key="currentQuestion">{{ currentQuestion }}</p>
          </transition>
        </div>

        <!-- 语音识别显示区域 -->
        <transition name="fade-slide">
          <div v-if="voicePanelVisible || isRecording || voiceText" class="voice-recognition-area">
            <button class="close-voice-btn" @click="cancelVoiceInput">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
            <div class="voice-header">
              <span class="voice-icon" :class="{ 'recording': isRecording }">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                  <line x1="12" y1="19" x2="12" y2="23"/>
                  <line x1="8" y1="23" x2="16" y2="23"/>
                </svg>
              </span>
              <span class="voice-status">
                {{ isRecording ? (useServerSpeech ? '正在聆听...(服务端)' : '正在聆听...(浏览器)') : '识别结果' }}
              </span>
            </div>
            <div class="voice-text-display">
              <p v-if="voiceText" class="recognized-text">{{ voiceText }}</p>
              <p v-else class="voice-placeholder">请开始说话...</p>
            </div>
            <div v-if="isRecording" class="voice-wave">
              <span v-for="i in 5" :key="i" class="wave-bar" :style="{ animationDelay: (i * 0.1) + 's' }"></span>
            </div>
          </div>
        </transition>

        <div class="input-area" :class="{ 'expanded': isInputMode }">
          <transition name="expand" mode="out-in">
            <div v-if="isInputMode" class="input-wrapper" key="input">
              <button 
                class="cancel-btn"
                @click="cancelInput"
                :disabled="checkinStore.isSubmitting"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
              <input 
                ref="inputRef"
                v-model="inputValue" 
                @keyup.enter="handleSubmit"
                @keyup.esc="cancelInput"
                type="text" 
                placeholder="请输入您的回答..." 
                class="answer-input"
                :disabled="checkinStore.isSubmitting"
              />
              <button 
                class="submit-btn"
                @click="handleSubmit"
                :disabled="!inputValue.trim() || checkinStore.isSubmitting"
              >
                <span v-if="checkinStore.isSubmitting" class="loading-spinner"></span>
                <span v-else>呈</span>
              </button>
            </div>
            <div v-else class="action-buttons" key="buttons">
              <button 
                class="action-btn text-btn" 
                @click="startInput"
                :disabled="!checkinStore.canAnswer"
              >
                <span class="btn-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path>
                  </svg>
                </span>
                <span class="btn-label">文字作答</span>
              </button>
              <button 
                class="action-btn voice-btn" 
                @click="isRecording ? stopVoiceInput() : startVoiceInput()"
                :disabled="!checkinStore.canAnswer && !isRecording"
                :class="{ 'recording': isRecording }"
              >
                <span class="btn-icon">
                  <svg v-if="isRecording" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="none">
                    <rect x="6" y="6" width="12" height="12"></rect>
                  </svg>
                  <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
                    <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                    <line x1="12" y1="19" x2="12" y2="23"></line>
                    <line x1="8" y1="23" x2="16" y2="23"></line>
                  </svg>
                </span>
                <span class="btn-label">{{ isRecording ? '点击停止' : '语音作答' }}</span>
              </button>
            </div>
          </transition>
        </div>

        <div class="card-footer">
          <span class="tip-text">
            {{ checkinStore.isLit ? '今日功课已完成，明日再续' : '每日健康答题，点亮长生星灯' }}
          </span>
        </div>
      </div>
    </section>

    <!-- 底部导航 -->
    
    <!-- 隐藏的管理入口 -->
    <NuxtLink to="/admin" class="admin-link">管理</NuxtLink>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, onMounted } from 'vue'
import { useUserStore } from '~/stores/user'
import { useCheckinStore } from '~/stores/checkin'
import { useLampsStore } from '~/stores/lamps'
import { useNotificationStore } from '~/stores/notification'
import CupLamp from '~/components/svg/CupLamp.vue'

// 使用中间件
definePageMeta({
  middleware: 'auth'
})

const userStore = useUserStore()
const checkinStore = useCheckinStore()
const lampsStore = useLampsStore()
const notificationStore = useNotificationStore()

const isInputMode = ref(false)
const inputValue = ref('')
const aiReply = ref('')
const inputRef = ref<HTMLInputElement | null>(null)
const showSourceTooltip = ref(false)
const isRecording = ref(false)
const voiceText = ref('')
const voicePanelVisible = ref(false)

const currentQuestion = computed(() => 
  checkinStore.currentQuestion?.question || '正在获取问题...'
)

const lampsLit = computed(() => lampsStore.litCount)

// 初始化
onMounted(async () => {
  // 初始化用户状态
  await userStore.init()
  
  if (!userStore.isLoggedIn) {
    navigateTo('/login')
    return
  }

  // 获取首页数据
  const homeData = await userStore.fetchHomeData()
  if (homeData) {
    checkinStore.syncFromHomeData(homeData)
  }

  // 获取灯阵状态
  await lampsStore.fetchStatus()

  // 获取今日问题
  await checkinStore.fetchQuestion()
})

// 换题
const handleChangeQuestion = async () => {
  aiReply.value = ''
  await checkinStore.changeQuestion()
}

// 开始输入
const toggleSourceTooltip = () => {
  showSourceTooltip.value = !showSourceTooltip.value
  if (showSourceTooltip.value) {
    setTimeout(() => {
      showSourceTooltip.value = false
    }, 4000)
  }
}

const startInput = async () => {
  isInputMode.value = true
  await nextTick()
  inputRef.value?.focus()
}

// 取消输入，返回选择界面
const cancelInput = () => {
  isInputMode.value = false
  inputValue.value = ''
}

// 提交回答
const handleSubmit = async () => {
  if (!inputValue.value.trim() || checkinStore.isSubmitting || !checkinStore.canAnswer) return
  
  aiReply.value = ''
  const questionText = currentQuestion.value
  const answerText = inputValue.value
  
  const result = await checkinStore.submitAnswer(answerText)
  
  if (result) {
    aiReply.value = result.reply || '已记录。'
    
    // 如果有效，刷新灯阵状态并触发通知
    if (result.valid) {
      await lampsStore.fetchStatus()
      
      // 添加具体的灯更新记录
      notificationStore.addLampUpdate({
        dimensionId: result.dimensionId || 2,
        subItemId: result.subItemId || 1,
        metricName: result.metricName || '健康指标',
        question: questionText,
        answer: answerText
      })
      
      // 自动换下一题
      if (checkinStore.canAnswer) {
        setTimeout(() => {
          handleChangeQuestion()
        }, 2000)
      }
    }
  }
  
  inputValue.value = ''
  isInputMode.value = false
}

// 语音输入功能 - 使用 Chrome 内置 Web Speech API 或服务端 API
let recognition: any = null
let finalTranscript = ''
let useServerSpeech = true
let speechWs: WebSocket | null = null
let micStream: MediaStream | null = null
let audioContext: AudioContext | null = null
let processor: ScriptProcessorNode | null = null
let sourceNode: MediaStreamAudioSourceNode | null = null
let upstreamOpen = false
let lastPartial = ''
let pendingPcmChunks: Uint8Array[] = []
let pendingPcmBytes = 0
const targetChunkMs = 200
const targetChunkBytes = Math.floor((16000 * 2 * targetChunkMs) / 1000)

const getSpeechRecognition = () => {
  const w = window as any
  return w.SpeechRecognition || w.webkitSpeechRecognition || null
}

const startVoiceInput = async () => {
  if (!checkinStore.canAnswer) return
  
  const SpeechRecognition = getSpeechRecognition()
  if (SpeechRecognition) {
    startBrowserRecognition(SpeechRecognition)
    return
  }
  startServerStreaming()
}

const startBrowserRecognition = (SpeechRecognition: any) => {
  try {
    voicePanelVisible.value = true
    useServerSpeech = false
    recognition = new SpeechRecognition()
    recognition.lang = 'zh-CN'
    recognition.continuous = true
    recognition.interimResults = true
    recognition.maxAlternatives = 1

    finalTranscript = ''
    lastPartial = ''
    isRecording.value = true
    voiceText.value = '正在聆听...'
    aiReply.value = ''

    recognition.onresult = (event: any) => {
      let interimTranscript = ''
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript
        if (event.results[i].isFinal) {
          finalTranscript += transcript
        } else {
          interimTranscript += transcript
        }
      }
      const merged = (finalTranscript + interimTranscript).trim()
      if (merged) {
        lastPartial = merged
        voiceText.value = merged
      }
    }

    recognition.onend = async () => {
      if (useServerSpeech) return
      isRecording.value = false
      const recognizedText = (finalTranscript || lastPartial || '').trim()
      await processRecognizedText(recognizedText)
      voicePanelVisible.value = false
    }

    recognition.onerror = async (event: any) => {
      if (useServerSpeech) return
      isRecording.value = false
      const err = String(event?.error || '未知错误')
      voiceText.value = `识别失败: ${err}`
      try { recognition?.abort?.() } catch {}
      recognition = null

      if (err === 'network') {
        useServerSpeech = true
        voiceText.value = '浏览器识别需要联网，已切换到服务端识别...'
        await startServerStreaming()
        return
      }

      useServerSpeech = true
      setTimeout(() => {
        if (!isRecording.value) voicePanelVisible.value = false
      }, 1500)
    }

    recognition.start()
  } catch (error: any) {
    useServerSpeech = true
    recognition = null
    startServerStreaming()
  }
}

const downsampleTo16kPcm16 = (input: Float32Array, inputSampleRate: number) => {
  if (inputSampleRate === 16000) {
    const out = new Int16Array(input.length)
    for (let i = 0; i < input.length; i++) {
      const s = Math.max(-1, Math.min(1, input[i]))
      out[i] = s < 0 ? s * 0x8000 : s * 0x7fff
    }
    return out
  }

  const ratio = inputSampleRate / 16000
  const outLength = Math.floor(input.length / ratio)
  const out = new Int16Array(outLength)
  for (let i = 0; i < outLength; i++) {
    const idx = i * ratio
    const idx0 = Math.floor(idx)
    const idx1 = Math.min(idx0 + 1, input.length - 1)
    const frac = idx - idx0
    const sample = input[idx0] * (1 - frac) + input[idx1] * frac
    const s = Math.max(-1, Math.min(1, sample))
    out[i] = s < 0 ? s * 0x8000 : s * 0x7fff
  }
  return out
}

const cleanupStreaming = async () => {
  upstreamOpen = false
  pendingPcmChunks = []
  pendingPcmBytes = 0
  if (processor) {
    try { processor.disconnect() } catch {}
    processor.onaudioprocess = null
  }
  if (sourceNode) {
    try { sourceNode.disconnect() } catch {}
  }
  processor = null
  sourceNode = null
  if (audioContext) {
    try { await audioContext.close() } catch {}
  }
  audioContext = null
  if (micStream) {
    micStream.getTracks().forEach(t => t.stop())
  }
  micStream = null
  if (speechWs && speechWs.readyState === WebSocket.OPEN) {
    try { speechWs.send(JSON.stringify({ type: 'end' })) } catch {}
    try { speechWs.close() } catch {}
  }
  speechWs = null
}

const flushPcmToSocket = () => {
  if (!speechWs || speechWs.readyState !== WebSocket.OPEN || !upstreamOpen) return
  if (speechWs.bufferedAmount > 512 * 1024) return
  while (pendingPcmBytes >= targetChunkBytes) {
    const out = new Uint8Array(targetChunkBytes)
    let outOffset = 0
    while (outOffset < targetChunkBytes && pendingPcmChunks.length) {
      const head = pendingPcmChunks[0]
      const take = Math.min(head.byteLength, targetChunkBytes - outOffset)
      out.set(head.subarray(0, take), outOffset)
      outOffset += take
      pendingPcmBytes -= take
      if (take === head.byteLength) {
        pendingPcmChunks.shift()
      } else {
        pendingPcmChunks[0] = head.subarray(take)
      }
    }
    if (outOffset === targetChunkBytes) {
      speechWs.send(out.buffer)
    } else {
      pendingPcmChunks.unshift(out.subarray(0, outOffset))
      pendingPcmBytes += outOffset
      break
    }
  }
}

const startServerStreaming = async () => {
  try {
    voicePanelVisible.value = true
    lastPartial = ''
    aiReply.value = ''
    voiceText.value = '连接中...'
    pendingPcmChunks = []
    pendingPcmBytes = 0

    micStream = await navigator.mediaDevices.getUserMedia({
      audio: {
        channelCount: 1,
        sampleRate: 16000,
        sampleSize: 16,
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true
      } as any
    })

    const proto = location.protocol === 'https:' ? 'wss' : 'ws'
    speechWs = new WebSocket(`${proto}://${location.host}/ws/speech`)
    speechWs.binaryType = 'arraybuffer'

    isRecording.value = true

    speechWs.onmessage = async (evt) => {
      let msg: any
      try { msg = JSON.parse(String(evt.data)) } catch { return }
      if (msg.type === 'ready') {
        voiceText.value = '已连接，等待识别服务就绪...'
        return
      }
      if (msg.type === 'upstream_open') {
        upstreamOpen = true
        voiceText.value = '正在聆听...'

        audioContext = new AudioContext({ sampleRate: 16000 })
        sourceNode = audioContext.createMediaStreamSource(micStream as MediaStream)
        processor = audioContext.createScriptProcessor(2048, 1, 1)
        processor.onaudioprocess = (e) => {
          if (!isRecording.value || !speechWs || speechWs.readyState !== WebSocket.OPEN || !upstreamOpen) return
          const input = e.inputBuffer.getChannelData(0)
          const pcm16 = downsampleTo16kPcm16(input, audioContext?.sampleRate || 48000)
          if (pcm16.byteLength > 0) {
            pendingPcmChunks.push(new Uint8Array(pcm16.buffer))
            pendingPcmBytes += pcm16.byteLength
            flushPcmToSocket()
          }
        }
        sourceNode.connect(processor)
        processor.connect(audioContext.destination)
        return
      }
      if (msg.type === 'partial' && typeof msg.text === 'string') {
        lastPartial = msg.text
        if (voiceText.value !== msg.text) voiceText.value = msg.text
        return
      }
      if (msg.type === 'upstream_close') {
        voiceText.value = '识别连接已断开，请重试'
        isRecording.value = false
        await cleanupStreaming()
        return
      }
      if (msg.type === 'error') {
        voiceText.value = '识别失败: ' + (msg.message || '未知错误')
        isRecording.value = false
        await cleanupStreaming()
      }
    }

    speechWs.onerror = async () => {
      voiceText.value = '识别失败: WebSocket 连接错误'
      isRecording.value = false
      await cleanupStreaming()
    }

    speechWs.onclose = async () => {
      isRecording.value = false
      await cleanupStreaming()
    }
  } catch (error: any) {
    console.error('启动流式录音失败:', error)
    isRecording.value = false
    await cleanupStreaming()
    voiceText.value = '无法启动录音: ' + (error?.message || '未知错误')
    alert('无法启动录音: ' + error.message)
  }
}

// 统一处理识别结果
const processRecognizedText = async (text: string) => {
  if (text && 
      text !== '正在聆听，请说话...' && 
      text !== '正在识别...' &&
      text !== '正在录音...(服务端识别)' &&
      text !== '正在上传识别...' &&
      text !== '正在整理您的回答...' &&
      text.length > 0) {
    
    voiceText.value = text
    aiReply.value = '正在验证您的回答...'
    
    const questionText = currentQuestion.value
    const submitResult = await checkinStore.submitAnswer(text)
    
    if (submitResult) {
      aiReply.value = submitResult.reply || '已记录。'
      
      if (submitResult.valid) {
        voiceText.value = text
        setTimeout(() => { voiceText.value = '' }, 1500)
        
        await lampsStore.fetchStatus()
        
        notificationStore.addLampUpdate({
          dimensionId: submitResult.dimensionId || 2,
          subItemId: submitResult.subItemId || 1,
          metricName: submitResult.metricName || '健康指标',
          question: questionText,
          answer: text
        })
        
        if (checkinStore.canAnswer) {
          setTimeout(() => { handleChangeQuestion() }, 1500)
        }
      } else {
        voiceText.value = text
        setTimeout(() => { voiceText.value = '' }, 1500)
      }
    }
    isRecording.value = false
  } else {
    voiceText.value = ''
    isRecording.value = false
  }
}

// 停止语音输入
const stopVoiceInput = () => {
  console.log('停止语音识别')
  
  if (useServerSpeech) {
    voiceText.value = '正在整理您的回答...'
    isRecording.value = false
    cleanupStreaming().then(async () => {
      await processRecognizedText(lastPartial.trim())
      voicePanelVisible.value = false
    })
  } else {
    if (recognition) {
      recognition.stop()
      voiceText.value = '正在整理您的回答...'
    }
  }
}

const cancelVoiceInput = () => {
  if (useServerSpeech) {
    cleanupStreaming()
  } else {
    if (recognition) {
      try { recognition.abort() } catch {}
      recognition = null
    }
  }
  isRecording.value = false
  voiceText.value = ''
  aiReply.value = ''
  voicePanelVisible.value = false
}
</script>

<style scoped>
/* 页面容器 */
.checkin-page {
  position: relative;
  min-height: 100vh;
  width: 100%;
  overflow: hidden;
  background: #F3E9D2;
}

/* 背景层 */
.page-background {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 0;
}

.paper-texture {
  position: absolute;
  inset: 0;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.05'/%3E%3C/svg%3E");
  opacity: 0.6;
}

.ink-wash {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.15;
}

.ink-1 {
  top: -10%;
  right: -10%;
  width: 60%;
  height: 40%;
  background: radial-gradient(circle, #8B4513 0%, transparent 70%);
  animation: inkFloat 20s ease-in-out infinite;
}

.ink-2 {
  bottom: 20%;
  left: -15%;
  width: 50%;
  height: 35%;
  background: radial-gradient(circle, #2C241B 0%, transparent 70%);
  animation: inkFloat 25s ease-in-out infinite reverse;
}

@keyframes inkFloat {
  0%, 100% { transform: translate(0, 0) scale(1); }
  50% { transform: translate(20px, 10px) scale(1.1); }
}

.falling-petals {
  position: absolute;
  inset: 0;
  overflow: hidden;
}

.petal {
  position: absolute;
  top: -20px;
  width: 8px;
  height: 12px;
  background: linear-gradient(135deg, #FFB6C1 0%, #FF69B4 100%);
  border-radius: 50% 0 50% 50%;
  opacity: 0.4;
  animation: petalFall 10s linear infinite;
}

@keyframes petalFall {
  0% {
    transform: translateY(-20px) rotate(0deg);
    opacity: 0;
  }
  10% { opacity: 0.4; }
  90% { opacity: 0.4; }
  100% {
    transform: translateY(100vh) rotate(360deg);
    opacity: 0;
  }
}

/* 顶部区域 */
.page-header {
  position: relative;
  z-index: 10;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 50px 16px 20px;
}

.stat-card {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.stat-card.left { align-items: flex-start; }
.stat-card.right { align-items: flex-end; }

.stat-label {
  font-size: 10px;
  color: #5D4E3F;
  letter-spacing: 2px;
}

.stat-value-group {
  display: flex;
  align-items: baseline;
  gap: 2px;
}

.stat-number {
  font-size: 28px;
  font-weight: 900;
  color: #2C241B;
  font-family: "Noto Serif SC", serif;
}

.stat-number.highlight {
  color: #A83232;
}

.stat-unit {
  font-size: 12px;
  color: #5D4E3F;
  font-weight: 600;
}

.title-area {
  text-align: center;
}

.main-title {
  font-size: 24px;
  font-weight: 900;
  color: #2C241B;
  letter-spacing: 8px;
  font-family: "Noto Serif SC", serif;
}

.sub-title {
  font-size: 10px;
  color: #8C735A;
  letter-spacing: 4px;
  margin-top: 4px;
}

/* 主灯区域 */
.main-lamp-section {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 10px 0 20px;
  z-index: 10;
}

.lamp-glow-bg {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 300px;
  height: 300px;
  background: radial-gradient(circle, rgba(255,165,0,0) 0%, transparent 70%);
  transition: all 1s ease;
  pointer-events: none;
}

.lamp-glow-bg.is-lit {
  background: radial-gradient(circle, rgba(255,165,0,0.2) 0%, transparent 70%);
  animation: glowPulse 3s ease-in-out infinite;
}

@keyframes glowPulse {
  0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 0.8; }
  50% { transform: translate(-50%, -50%) scale(1.1); opacity: 1; }
}

.lamp-container {
  position: relative;
  transition: all 0.5s ease;
}

.lamp-container.is-lit {
  filter: drop-shadow(0 0 30px rgba(255,165,0,0.4));
}

/* 进度指示 */
.progress-indicator {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 10px;
  width: 100%;
}

.stepped-progress {
  position: relative;
  width: 240px; /* 增加宽度以容纳节点 */
  height: 30px;
  display: flex;
  align-items: center;
}

.progress-line-bg {
  position: absolute;
  left: 0;
  right: 0;
  top: 50%;
  height: 2px;
  background: rgba(44, 36, 27, 0.1);
  transform: translateY(-50%);
  z-index: 1;
}

.progress-line-fill {
  position: absolute;
  left: 0;
  top: 50%;
  height: 2px;
  background: linear-gradient(90deg, #D4AF37, #A83232);
  transform: translateY(-50%);
  z-index: 2;
  transition: width 0.5s ease;
}

.progress-steps {
  position: relative;
  width: 100%;
  display: flex;
  justify-content: space-between;
  z-index: 3;
}

.step-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #F3E9D2; /* 与背景色一致，制造镂空感 */
  border: 2px solid rgba(44, 36, 27, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.dot-inner {
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: rgba(44, 36, 27, 0.2);
  transition: all 0.3s ease;
}

.step-dot.active {
  border-color: #D4AF37;
  background: #F3E9D2;
}

.step-dot.active .dot-inner {
  background: #D4AF37;
}

.step-dot.current {
  border-color: #A83232;
  transform: scale(1.3);
  box-shadow: 0 0 10px rgba(168, 50, 50, 0.3);
}

.step-dot.current .dot-inner {
  background: #A83232;
}

/* 问答卡片 */
.question-section {
  position: relative;
  z-index: 20;
  padding: 0 16px 20px;
}

.question-card {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(44, 36, 27, 0.1);
  border-radius: 20px;
  padding: 20px;
  box-shadow: 0 10px 40px -10px rgba(44, 36, 27, 0.15);
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.source-info-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.info-btn {
  background: none;
  border: none;
  padding: 4px;
  color: #8C735A;
  opacity: 0.6;
  cursor: pointer;
  display: flex;
  align-items: center;
  transition: opacity 0.3s;
}

.info-btn:hover {
  opacity: 1;
}

.source-tooltip {
  position: absolute;
  top: 100%;
  left: 0;
  margin-top: 8px;
  background: rgba(44, 36, 27, 0.95);
  color: #F3E9D2;
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 11px;
  white-space: nowrap;
  z-index: 100;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  border: 1px solid rgba(243, 233, 210, 0.1);
}

.source-tooltip::before {
  content: '';
  position: absolute;
  top: -4px;
  left: 10px;
  width: 8px;
  height: 8px;
  background: rgba(44, 36, 27, 0.95);
  transform: rotate(45deg);
  border-top: 1px solid rgba(243, 233, 210, 0.1);
  border-left: 1px solid rgba(243, 233, 210, 0.1);
}

.card-badge {
  font-size: 10px;
  font-weight: 700;
  color: #A83232;
  letter-spacing: 2px;
  padding: 4px 10px;
  background: rgba(168, 50, 50, 0.1);
  border-radius: 20px;
}

.question-count {
  font-size: 11px;
  color: #8C735A;
}

.refresh-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  background: transparent;
  border: 1px solid rgba(44, 36, 27, 0.2);
  border-radius: 20px;
  color: #5D4E3F;
  font-size: 11px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.refresh-btn:hover:not(:disabled) {
  background: rgba(44, 36, 27, 0.05);
}

.refresh-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.refresh-icon {
  font-size: 14px;
}

.refresh-icon.spinning {
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* AI 回复区 */
.ai-reply-area {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 12px 16px;
  background: rgba(168, 50, 50, 0.08);
  border-radius: 12px;
  margin-bottom: 16px;
}

.reply-icon {
  color: #A83232;
  font-size: 16px;
}

.reply-text {
  font-size: 14px;
  color: #A83232;
  font-weight: 600;
  line-height: 1.6;
  font-family: "Noto Serif SC", serif;
}

/* 语音识别显示区域 */
.voice-recognition-area {
  position: relative;
  background: linear-gradient(135deg, rgba(212, 175, 55, 0.1) 0%, rgba(168, 50, 50, 0.08) 100%);
  border: 1px solid rgba(212, 175, 55, 0.3);
  border-radius: 16px;
  padding: 16px;
  margin-bottom: 16px;
}

.close-voice-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  padding: 0;
  background: rgba(255, 255, 255, 0.5);
  border: 1px solid rgba(44, 36, 27, 0.1);
  border-radius: 50%;
  color: #5D4E3F;
  cursor: pointer;
  transition: all 0.3s ease;
  z-index: 5;
}

.close-voice-btn:hover {
  background: rgba(168, 50, 50, 0.1);
  color: #A83232;
  border-color: rgba(168, 50, 50, 0.2);
}

.voice-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.voice-icon {
  font-size: 20px;
  transition: all 0.3s ease;
}

.voice-icon.recording {
  animation: micPulse 1s ease-in-out infinite;
}

@keyframes micPulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.2); }
}

.voice-status {
  font-size: 12px;
  font-weight: 600;
  color: #8C735A;
  letter-spacing: 1px;
}

.voice-text-display {
  min-height: 40px;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.6);
  border-radius: 12px;
  margin-bottom: 12px;
}

.recognized-text {
  font-size: 16px;
  color: #2C241B;
  font-weight: 600;
  line-height: 1.6;
  font-family: "Noto Serif SC", serif;
  margin: 0;
}

.voice-placeholder {
  font-size: 14px;
  color: #8C735A;
  font-style: italic;
  margin: 0;
}

.voice-wave {
  display: flex;
  justify-content: center;
  align-items: flex-end;
  gap: 4px;
  height: 24px;
}

.wave-bar {
  width: 4px;
  background: linear-gradient(to top, #D4AF37, #A83232);
  border-radius: 2px;
  animation: waveAnimation 0.8s ease-in-out infinite;
}

.wave-bar:nth-child(1) { height: 8px; }
.wave-bar:nth-child(2) { height: 16px; }
.wave-bar:nth-child(3) { height: 24px; }
.wave-bar:nth-child(4) { height: 16px; }
.wave-bar:nth-child(5) { height: 8px; }

@keyframes waveAnimation {
  0%, 100% { transform: scaleY(0.5); }
  50% { transform: scaleY(1); }
}

/* 问题区 */
.question-area {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 20px;
}

.question-icon {
  flex-shrink: 0;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #2C241B;
  color: #F3E9D2;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 700;
  font-family: "Noto Serif SC", serif;
}

.question-text {
  font-size: 17px;
  color: #2C241B;
  font-weight: 700;
  line-height: 1.7;
  font-family: "Noto Serif SC", serif;
}

/* 输入区 */
.input-area {
  margin-top: 16px;
}

.input-wrapper {
  display: flex;
  gap: 10px;
}

.answer-input {
  flex: 1;
  padding: 14px 18px;
  background: rgba(44, 36, 27, 0.05);
  border: 1px solid rgba(44, 36, 27, 0.15);
  border-radius: 14px;
  font-size: 15px;
  color: #2C241B;
  font-family: "Noto Serif SC", serif;
  transition: all 0.3s ease;
}

.answer-input:focus {
  outline: none;
  border-color: #A83232;
  background: rgba(255, 255, 255, 0.8);
}

.answer-input::placeholder {
  color: #8C735A;
}

.submit-btn {
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #A83232 0%, #8A2525 100%);
  border: none;
  border-radius: 14px;
  color: #F3E9D2;
  font-size: 16px;
  font-weight: 700;
  font-family: "Noto Serif SC", serif;
  cursor: pointer;
  transition: all 0.3s ease;
}

.submit-btn:hover:not(:disabled) {
  transform: scale(1.05);
  box-shadow: 0 5px 20px rgba(168, 50, 50, 0.4);
}

.submit-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* 取消按钮 */
.cancel-btn {
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(44, 36, 27, 0.08);
  border: 1px solid rgba(44, 36, 27, 0.15);
  border-radius: 14px;
  color: #5D4E3F;
  font-size: 18px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.cancel-btn:hover:not(:disabled) {
  background: rgba(44, 36, 27, 0.15);
  color: #2C241B;
}

.cancel-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.loading-spinner {
  width: 20px;
  height: 20px;
  border: 2px solid rgba(243, 233, 210, 0.3);
  border-top-color: #F3E9D2;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

/* 操作按钮 */
.action-buttons {
  display: flex;
  gap: 12px;
}

.action-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 16px;
  border-radius: 14px;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
}

.text-btn {
  background: rgba(44, 36, 27, 0.08);
  border: 1px solid rgba(44, 36, 27, 0.15);
  color: #2C241B;
}

.text-btn:hover:not(:disabled) {
  background: #2C241B;
  color: #F3E9D2;
}

.voice-btn {
  background: linear-gradient(135deg, #A83232 0%, #8A2525 100%);
  border: none;
  color: #F3E9D2;
}

.voice-btn.recording {
  animation: pulse 1s ease-in-out infinite;
  background: linear-gradient(135deg, #D44444 0%, #A83232 100%);
}

@keyframes pulse {
  0%, 100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(168, 50, 50, 0.4); }
  50% { transform: scale(1.02); box-shadow: 0 0 20px 5px rgba(168, 50, 50, 0.3); }
}

.voice-btn:disabled,
.text-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-icon {
  font-size: 16px;
  font-family: "Noto Serif SC", serif;
}

.btn-label {
  letter-spacing: 2px;
}

/* 底部提示 */
.card-footer {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid rgba(44, 36, 27, 0.08);
  text-align: center;
}

.tip-text {
  font-size: 11px;
  color: #8C735A;
  letter-spacing: 1px;
}

/* 管理入口 */
.admin-link {
  position: fixed;
  top: 10px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 10px;
  color: transparent;
  text-decoration: none;
  z-index: 100;
}

.admin-link:hover {
  color: #8C735A;
}

/* 过渡动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.4s ease;
}

.fade-slide-enter-from {
  opacity: 0;
  transform: translateY(-10px);
}

.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

.expand-enter-active,
.expand-leave-active {
  transition: all 0.3s ease;
}

.expand-enter-from,
.expand-leave-to {
  opacity: 0;
  transform: scaleY(0.9);
}
</style>
