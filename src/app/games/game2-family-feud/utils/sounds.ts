type SoundName =
  | 'buzzer'
  | 'correct'
  | 'wrong'
  | 'reveal'
  | 'lockout'
  | 'roundEnd'
  | 'winner'
  | 'tick'
  | 'background'

class SoundManager {
  private ctx: AudioContext | null = null
  private muted = false
  private vol = 0.5

  constructor() {
    if (typeof window === 'undefined') return
    const init = () => {
      if (this.ctx) return
      const Ctor =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      this.ctx = new Ctor()
    }
    document.addEventListener('click', init, { once: true })
    document.addEventListener('touchstart', init, { once: true })
  }

  private tone(
    freq: number,
    type: OscillatorType,
    start: number,
    duration: number,
    gain: number,
    freqEnd?: number,
  ) {
    const ctx = this.ctx
    if (!ctx) return
    const osc = ctx.createOscillator()
    const g = ctx.createGain()
    osc.connect(g)
    g.connect(ctx.destination)
    osc.type = type
    osc.frequency.setValueAtTime(freq, start)
    if (freqEnd !== undefined) {
      osc.frequency.exponentialRampToValueAtTime(freqEnd, start + duration)
    }
    g.gain.setValueAtTime(this.vol * gain, start)
    g.gain.exponentialRampToValueAtTime(0.001, start + duration)
    osc.start(start)
    osc.stop(start + duration)
  }

  play(name: SoundName) {
    if (this.muted || !this.ctx) return
    const now = this.ctx.currentTime
    switch (name) {
      case 'buzzer':
        this.tone(120, 'sawtooth', now, 0.18, 0.35)
        break
      case 'correct':
        // C major arpeggio
        ;([523.25, 659.25, 783.99] as const).forEach((f, i) =>
          this.tone(f, 'sine', now + i * 0.06, 0.7, 0.22),
        )
        break
      case 'wrong':
        // Descending buzz
        this.tone(300, 'square', now, 0.3, 0.38, 100)
        break
      case 'reveal':
        // Rising sweep
        this.tone(220, 'sine', now, 0.35, 0.3, 880)
        break
      case 'lockout':
        // Three short strikes
        ;[0, 0.14, 0.28].forEach((d) => this.tone(140, 'square', now + d, 0.1, 0.5))
        break
      case 'roundEnd':
        // Two-tone chime
        ;([659.25, 783.99] as const).forEach((f, i) =>
          this.tone(f, 'sine', now + i * 0.12, 0.6, 0.25),
        )
        break
      case 'winner':
        // Victory fanfare C-E-G-C
        ;([523.25, 659.25, 783.99, 1046.5] as const).forEach((f, i) =>
          this.tone(f, 'sine', now + i * 0.14, 0.55, 0.3),
        )
        break
      case 'tick':
        this.tone(900, 'square', now, 0.04, 0.15)
        break
      case 'background':
        // Not implemented for oscillator-based audio
        break
    }
  }

  // kept for compatibility — oscillator sounds stop on their own
  stop(_name: SoundName) {}

  toggleMute(): boolean {
    this.muted = !this.muted
    return this.muted
  }

  get isMuted() {
    return this.muted
  }
}

export const sounds = new SoundManager()
