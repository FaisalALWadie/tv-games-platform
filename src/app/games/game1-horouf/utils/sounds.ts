let audioContext: AudioContext | null = null
let muted = false

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null
  if (!audioContext) {
    audioContext = new window.AudioContext()
  }
  if (audioContext.state === 'suspended') {
    void audioContext.resume()
  }
  return audioContext
}

function playTone(
  frequency: number,
  duration: number,
  type: OscillatorType = 'sine',
  volume = 0.3,
  startDelay = 0,
): void {
  if (muted) return
  const ctx = getAudioContext()
  if (!ctx) return
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  const t = ctx.currentTime + startDelay
  osc.type = type
  osc.frequency.value = frequency
  gain.gain.setValueAtTime(0.001, t)
  gain.gain.exponentialRampToValueAtTime(volume, t + 0.01)
  gain.gain.exponentialRampToValueAtTime(0.001, t + duration)
  osc.connect(gain)
  gain.connect(ctx.destination)
  osc.start(t)
  osc.stop(t + duration)
}

export function playSelectSound(): void {
  playTone(1200, 0.05, 'square', 0.15)
}

export function playAwardSound(): void {
  playTone(880, 0.12, 'sine', 0.25)
  playTone(1320, 0.15, 'sine', 0.2, 0.08)
}

export function playNewQuestionSound(): void {
  playTone(350, 0.08, 'sine', 0.12)
  playTone(500, 0.1, 'sine', 0.1, 0.06)
}

export function playShowAnswerSound(): void {
  playTone(523, 0.15, 'sine', 0.2)
  playTone(784, 0.2, 'sine', 0.25, 0.15)
}

export function playRoundStartSound(): void {
  playTone(523, 0.15, 'triangle', 0.25)
  playTone(659, 0.15, 'triangle', 0.25, 0.18)
  playTone(784, 0.3, 'triangle', 0.3, 0.36)
}

export function playRoundWinSound(): void {
  playTone(523, 0.1, 'sine', 0.25)
  playTone(659, 0.1, 'sine', 0.25, 0.12)
  playTone(784, 0.1, 'sine', 0.25, 0.24)
  playTone(1047, 0.45, 'sine', 0.3, 0.36)
}

export function playMatchWinSound(): void {
  playTone(523, 0.1, 'sine', 0.25)
  playTone(659, 0.1, 'sine', 0.25, 0.12)
  playTone(784, 0.1, 'sine', 0.25, 0.24)
  playTone(1047, 0.12, 'sine', 0.3, 0.36)
  playTone(1319, 0.12, 'sine', 0.3, 0.5)
  playTone(1568, 0.6, 'sine', 0.35, 0.65)
}

export function playBuzzerSound(): void {
  playTone(120, 0.3, 'square', 0.2)
}

export function setMuted(value: boolean): void {
  muted = value
}

export function isMuted(): boolean {
  return muted
}
