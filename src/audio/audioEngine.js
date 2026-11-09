import { sceneTracks } from '../data/audio.js';
import { playEffect, synthMusic } from './synth.js';

const VOLUME_KEY = 'our-little-journey:volume:v1';

function savedVolume() {
  try {
    const saved = localStorage.getItem(VOLUME_KEY);
    const volume = saved === null ? NaN : Number(saved);
    if (volume >= 0 && volume <= 1) return volume;
  } catch {
    // Storage is optional for audio controls.
  }
  return 0.55;
}

class AudioEngine {
  enabled = false;
  hidden = false;
  volume = savedVolume();
  synthBuffers = new Map();
  musicFile = null;

  setEnabled(enabled) {
    if (enabled && !this.context) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return false;
      try {
        this.context = new AudioContext();
        this.master = this.context.createGain();
        this.master.gain.value = 0;
        this.master.connect(this.context.destination);
      } catch {
        return false;
      }
    }

    this.enabled = enabled;
    if (enabled && !this.hidden) {
      this.resume();
    } else {
      this.stopMusic();
      this.setMotorSpeed(0);
      this.applyVolume();
    }
    return true;
  }

  setVolume(volume) {
    this.volume = volume;
    this.applyVolume();
    try {
      localStorage.setItem(VOLUME_KEY, String(volume));
    } catch {
      // Volume remains available during the current visit.
    }
  }

  applyVolume() {
    this.master?.gain.setTargetAtTime(this.enabled ? this.volume : 0, this.context.currentTime, 0.08);
  }

  setHidden(hidden) {
    this.hidden = hidden;
    if (hidden) this.context?.suspend().catch(() => {});
    else if (this.enabled) this.resume();
  }

  resume() {
    this.context.resume().then(() => {
      if (this.hidden || !this.enabled) return;
      this.applyVolume();
      this.updateMusic();
    }).catch(() => {});
  }

  setScene(scene) {
    if (this.scene === scene) return;
    if (this.scene) this.effect('transition');
    this.scene = scene;
    this.setMotorSpeed(0);
    this.updateMusic();
  }

  updateMusic() {
    if (!this.audible || !this.scene) return;
    const { file, mood } = sceneTracks[this.scene];
    const key = file ?? mood;
    if (this.musicKey === key) return;
    this.musicKey = key;
    this.request?.abort();

    if (file && this.musicFile?.name === file) {
      this.crossfade(this.musicFile.buffer);
      return;
    }
    if (!this.synthBuffers.has(mood)) this.synthBuffers.set(mood, synthMusic(this.context, mood));
    this.crossfade(this.synthBuffers.get(mood));
    if (!file) return;

    const request = new AbortController();
    this.request = request;
    const url = `${import.meta.env.BASE_URL}assets/audio/${encodeURIComponent(file)}`;
    fetch(url, { signal: request.signal }).then((response) => {
      if (!response.ok) throw new Error('Audio unavailable');
      return response.arrayBuffer();
    }).then((bytes) => this.context.decodeAudioData(bytes)).then((buffer) => {
      if (request.signal.aborted || this.musicKey !== key) return;
      this.musicFile = { name: file, buffer };
      if (this.enabled) this.crossfade(buffer);
    }).catch(() => {});
  }

  crossfade(buffer) {
    const now = this.context.currentTime;
    this.fadeTrack(now);
    const source = this.context.createBufferSource();
    const gain = this.context.createGain();
    source.buffer = buffer;
    source.loop = true;
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.36, now + 0.65);
    source.connect(gain).connect(this.master);
    source.onended = () => { source.disconnect(); gain.disconnect(); };
    source.start(now);
    this.track = { source, gain, started: now };
  }

  fadeTrack(now) {
    if (!this.track) return;
    const { source, gain, started } = this.track;
    gain.gain.cancelScheduledValues(now);
    gain.gain.setValueAtTime(0.36 * Math.min(1, (now - started) / 0.65), now);
    gain.gain.setTargetAtTime(0, now, 0.13);
    source.stop(now + 0.65);
    this.track = null;
  }

  stopMusic() {
    this.request?.abort();
    this.musicKey = null;
    if (this.context) this.fadeTrack(this.context.currentTime);
  }

  get audible() {
    return this.enabled && !this.hidden && this.context?.state === 'running';
  }

  effect(name) {
    if (this.audible) playEffect(this.context, this.master, name);
  }

  setMotorSpeed(speed) {
    const level = this.audible ? Math.min(10, Math.round(Math.max(0, speed) / 12)) : 0;
    if (level === this.motorLevel) return;
    this.motorLevel = level;
    if (!level) {
      if (this.motor) {
        const { oscillator, gain } = this.motor;
        const now = this.context.currentTime;
        gain.gain.setTargetAtTime(0, now, 0.04);
        oscillator.stop(now + 0.25);
        this.motor = null;
      }
      return;
    }

    const now = this.context.currentTime;
    if (!this.motor) {
      const oscillator = this.context.createOscillator();
      const gain = this.context.createGain();
      oscillator.type = 'triangle';
      oscillator.frequency.value = 38;
      gain.gain.value = 0;
      oscillator.connect(gain).connect(this.master);
      oscillator.onended = () => { oscillator.disconnect(); gain.disconnect(); };
      oscillator.start();
      this.motor = { oscillator, gain };
    }
    this.motor.oscillator.frequency.setTargetAtTime(38 + level * 4, now, 0.08);
    this.motor.gain.gain.setTargetAtTime(0.012 + level * 0.002, now, 0.08);
  }

  destroy() {
    this.stopMusic();
    this.setMotorSpeed(0);
    this.context?.close().catch(() => {});
    this.synthBuffers.clear();
    this.musicFile = null;
  }
}

export const audio = new AudioEngine();
