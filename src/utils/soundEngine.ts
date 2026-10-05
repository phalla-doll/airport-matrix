import { SoundMode } from '../types';

class SoundEngine {
  private ctx: AudioContext | null = null;
  private soundMode: SoundMode = 'system';
  private volume: number = 0.7;
  private tickIntervalId: number | null = null;
  private isTock = false;

  private initCtx() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  public setSoundMode(mode: SoundMode) {
    this.soundMode = mode;
    if (mode !== 'watch') {
      this.stopWatchTick();
    }
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
  }

  public getSoundMode(): SoundMode {
    return this.soundMode;
  }

  public getVolume(): number {
    return this.volume;
  }

  // Water droplet button sound (as praised in the video comments!)
  public playDroplet() {
    if (this.soundMode === 'mute' || this.volume <= 0) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      // Pitch sweep mimicking a water droplet drop & surface bubble
      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, now);
      osc.frequency.exponentialRampToValueAtTime(1750, now + 0.075);
      osc.frequency.exponentialRampToValueAtTime(1400, now + 0.12);

      // Volume envelope
      const maxGain = 0.22 * this.volume;
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(maxGain, now + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.14);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.15);
    } catch {
      // AudioContext policy fallback
    }
  }

  // Mechanical Matrix / Split-Flap solenoid latch click
  public playMatrixFlip() {
    if (this.soundMode === 'mute' || this.volume <= 0) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      // High click
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(180, now);
      osc.frequency.exponentialRampToValueAtTime(45, now + 0.035);

      gain.gain.setValueAtTime(0.3 * this.volume, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.038);

      // Shaped noise transient
      const bufferSize = this.ctx.sampleRate * 0.025;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.2));
      }
      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = 2400;
      filter.Q.value = 2;

      const noiseGain = this.ctx.createGain();
      noiseGain.gain.setValueAtTime(0.18 * this.volume, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.025);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      noise.connect(filter);
      filter.connect(noiseGain);
      noiseGain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.04);
      noise.start(now);
      noise.stop(now + 0.03);
    } catch {
      // Ignore
    }
  }

  // Mechanical Watch escapement tick
  public playSingleWatchTick() {
    if (this.soundMode === 'mute' || this.volume <= 0) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      this.isTock = !this.isTock;
      // Slight pitch variance between tick and tock
      const freq = this.isTock ? 1800 : 1600;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);
      osc.frequency.exponentialRampToValueAtTime(freq * 0.6, now + 0.018);

      gain.gain.setValueAtTime(0.15 * this.volume, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.02);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.025);
    } catch {
      // Ignore
    }
  }

  public startWatchTick() {
    if (this.tickIntervalId !== null) return;
    this.playSingleWatchTick();
    this.tickIntervalId = window.setInterval(() => {
      if (this.soundMode === 'watch') {
        this.playSingleWatchTick();
      } else {
        this.stopWatchTick();
      }
    }, 1000);
  }

  public stopWatchTick() {
    if (this.tickIntervalId !== null) {
      clearInterval(this.tickIntervalId);
      this.tickIntervalId = null;
    }
  }

  // Airport departure gate chime (two-tone melodic announcement chime)
  public playBoardingChime() {
    if (this.soundMode === 'mute' || this.volume <= 0) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      // Tone 1: F#5 (739.99 Hz)
      const osc1 = this.ctx.createOscillator();
      const gain1 = this.ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(740, now);

      gain1.gain.setValueAtTime(0.001, now);
      gain1.gain.linearRampToValueAtTime(0.25 * this.volume, now + 0.05);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.7);

      osc1.connect(gain1);
      gain1.connect(this.ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.75);

      // Tone 2: C#5 (554.37 Hz)
      const osc2 = this.ctx.createOscillator();
      const gain2 = this.ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(554.37, now + 0.35);

      gain2.gain.setValueAtTime(0.001, now + 0.35);
      gain2.gain.linearRampToValueAtTime(0.28 * this.volume, now + 0.4);
      gain2.gain.exponentialRampToValueAtTime(0.0001, now + 1.4);

      osc2.connect(gain2);
      gain2.connect(this.ctx.destination);
      osc2.start(now + 0.35);
      osc2.stop(now + 1.45);
    } catch {
      // Ignore
    }
  }
}

export const sound = new SoundEngine();
