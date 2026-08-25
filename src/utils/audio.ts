// Web Audio API and Speech Synthesis for realistic UPI sound effects and voice notifications

class SoundEngine {
  private ctx: AudioContext | null = null;
  private soundEnabled: boolean = true;
  private soundboxVoiceEnabled: boolean = true;
  private soundboxLanguage: 'hi-IN' | 'en-IN' = 'en-IN';

  constructor() {
    // Lazy initialize on first interaction to respect browser autoplay policies
  }

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  public setSoundEnabled(enabled: boolean) {
    this.soundEnabled = enabled;
  }

  public isSoundEnabled(): boolean {
    return this.soundEnabled;
  }

  public setSoundboxVoiceEnabled(enabled: boolean) {
    this.soundboxVoiceEnabled = enabled;
  }

  public isSoundboxVoiceEnabled(): boolean {
    return this.soundboxVoiceEnabled;
  }

  public setSoundboxLanguage(lang: 'hi-IN' | 'en-IN') {
    this.soundboxLanguage = lang;
  }

  public getSoundboxLanguage(): 'hi-IN' | 'en-IN' {
    return this.soundboxLanguage;
  }

  // Keypad click sound
  public playKeyClick() {
    if (!this.soundEnabled) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.04);

      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.04);
    } catch {
      // Audio failed gracefully
    }
  }

  // Pin digit delete click
  public playDeleteClick() {
    if (!this.soundEnabled) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(250, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(150, ctx.currentTime + 0.05);

      gain.gain.setValueAtTime(0.07, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.05);
    } catch {
      // Audio failed gracefully
    }
  }

  // Pleasant triumphant UPI payment success chime (Harmonic Triad: C5 -> E5 -> G5 -> C6)
  public playPaymentSuccessChime() {
    if (!this.soundEnabled) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;

      const notes = [
        { freq: 523.25, time: 0, duration: 0.12 },    // C5
        { freq: 659.25, time: 0.1, duration: 0.12 },   // E5
        { freq: 783.99, time: 0.2, duration: 0.18 },   // G5
        { freq: 1046.50, time: 0.35, duration: 0.45 }, // C6
      ];

      notes.forEach(({ freq, time, duration }) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + time);

        gain.gain.setValueAtTime(0.12, ctx.currentTime + time);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + time + duration);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(ctx.currentTime + time);
        osc.stop(ctx.currentTime + time + duration);
      });
    } catch {
      // Audio failed gracefully
    }
  }

  // Error / failure thud
  public playErrorSound() {
    if (!this.soundEnabled) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(160, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.2);

      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.2);
    } catch {
      // Audio failed gracefully
    }
  }

  // Announce payment via Smart Soundbox using Web Speech API
  public announceSoundbox(amount: number, language?: 'hi-IN' | 'en-IN') {
    if (!this.soundboxVoiceEnabled) return;
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    const lang = language || this.soundboxLanguage;

    // Small delay so success chime finishes first
    setTimeout(() => {
      try {
        window.speechSynthesis.cancel(); // clear previous queue

        let text = `Rupees ${amount} received on UPI`;
        if (lang === 'hi-IN') {
          text = `यूपीआई पर ${amount} रुपये प्राप्त हुए`;
        }

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = lang;
        utterance.rate = 0.95; // Slightly measured rate like a real merchant soundbox
        utterance.pitch = 1.05;

        // Try to pick Hindi or Indian English voice if available
        const voices = window.speechSynthesis.getVoices();
        const preferredVoice = voices.find(v => v.lang.includes(lang === 'hi-IN' ? 'hi' : 'en-IN') || v.name.includes('India'));
        if (preferredVoice) {
          utterance.voice = preferredVoice;
        }

        window.speechSynthesis.speak(utterance);
      } catch {
        // Speech synthesis failed gracefully
      }
    }, 650);
  }
}

export const sound = new SoundEngine();
