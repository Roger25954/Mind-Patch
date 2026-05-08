import * as THREE from 'three';
import { ASSET_PATHS } from '../constants';

export default class AudioManager {
  private listener: THREE.AudioListener;
  private audioLoader = new THREE.AudioLoader();
  private buffers = new Map<string, AudioBuffer>();
  private bgmAudio: THREE.Audio | null = null;
  private masterVolume = 1;
  private fadeMs = 1000;

  constructor(camera: THREE.Camera) {
    this.listener = new THREE.AudioListener();
    camera.add(this.listener);
    this._ensureContextUnlock();
  }

  private _ensureContextUnlock() {
    const ctx = (this.listener as any).context as AudioContext | undefined;
    if (!ctx) return;

    const resume = () => {
      if (ctx.state === 'suspended') {
        ctx.resume().catch(() => {});
      }
      window.removeEventListener('pointerdown', resume);
      window.removeEventListener('click', resume);
      window.removeEventListener('touchstart', resume);
    };

    window.addEventListener('pointerdown', resume, { once: true });
    window.addEventListener('click', resume, { once: true });
    window.addEventListener('touchstart', resume, { once: true });
  }

  async loadAll(): Promise<void> {
    const audioEntries = ASSET_PATHS.audio || {};
    const loader = this.audioLoader;

    const promises = Object.entries(audioEntries).map(([key, url]) => {
      return new Promise<void>((resolve) => {
        let done = false;
        const finish = () => {
          if (done) return;
          done = true;
          window.clearTimeout(timeoutId);
          resolve();
        };
        const timeoutId = window.setTimeout(() => {
          if (done) return;
          done = true;
          console.warn(`Audio timeout ${url}: se omite para continuar.`);
          resolve();
        }, 3500);

        loader.load(
          url,
          (buffer) => {
            this.buffers.set(key, buffer);
            finish();
          },
          undefined,
          (err) => {
            console.warn(`Failed to load audio ${url}:`, err);
            finish();
          }
        );
      });
    });

    await Promise.all(promises);
  }

  playBGM(name: string): void {
    const buffer = this.buffers.get(name);
    if (!buffer) {
      console.warn(`BGM not loaded: ${name}`);
      return;
    }

    const newAudio = new THREE.Audio(this.listener);
    newAudio.setBuffer(buffer);
    newAudio.setLoop(true);
    newAudio.setVolume(0);
    newAudio.play();

    // Fade out previous
    if (this.bgmAudio && this.bgmAudio.isPlaying) {
      this._fade(this.bgmAudio, this.bgmAudio.getVolume ? this.bgmAudio.getVolume() : this.masterVolume, 0, this.fadeMs, () => {
        try {
          this.bgmAudio && this.bgmAudio.stop();
        } catch {}
      });
    }

    // Fade in new
    this._fade(newAudio, 0, this.masterVolume, this.fadeMs);
    this.bgmAudio = newAudio;
  }

  playSFX(name: string): void {
    const buffer = this.buffers.get(name);
    if (!buffer) {
      console.warn(`SFX not loaded: ${name}`);
      return;
    }

    const sfx = new THREE.Audio(this.listener);
    sfx.setBuffer(buffer);
    sfx.setLoop(false);
    sfx.setVolume(this.masterVolume);
    sfx.play();

    // Clean up after playback
    const durationMs = (buffer.duration || 4) * 1000 + 200;
    setTimeout(() => {
      try {
        sfx.stop();
      } catch {}
    }, durationMs);
  }

  stopAll(): void {
    if (this.bgmAudio && this.bgmAudio.isPlaying) {
      try {
        this.bgmAudio.stop();
      } catch {}
    }
  }

  setMasterVolume(vol: number): void {
    this.masterVolume = Math.max(0, Math.min(1, vol));
    if (this.bgmAudio) this.bgmAudio.setVolume(this.masterVolume);
  }

  private _fade(audio: THREE.Audio, from: number, to: number, ms: number, onComplete?: () => void) {
    const start = performance.now();
    const step = () => {
      const t = Math.min(1, (performance.now() - start) / ms);
      const v = from + (to - from) * t;
      try {
        audio.setVolume(v);
      } catch {}
      if (t < 1) requestAnimationFrame(step);
      else onComplete && onComplete();
    };
    step();
  }
}
