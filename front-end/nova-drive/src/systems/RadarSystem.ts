import * as THREE from 'three';
import StarItem from '../entities/StarItem';
import DebrisItem from '../entities/DebrisItem';

type RadarEntry = {
  x: number;
  y: number;
  color: string;
  timestamp: number;
};

export default class RadarSystem {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private width = 160;
  private height = 160;
  private centerX = this.width / 2;
  private centerY = this.height / 2;
  private radius = Math.min(this.width, this.height) / 2 - 8;
  private entries = new Map<string, RadarEntry>();
  private sweepAngle = 0; // radians
  private sweepSpeed = (2 * Math.PI) / 60; // 1 RPM -> 2pi per 60s
  private timeAcc = 0;
  private maxAgeMs = 400; // only render recently updated items

  constructor(parentElement: HTMLElement) {
    this.canvas = document.createElement('canvas');
    this.canvas.style.position = 'absolute';
    this.canvas.style.top = '8px';
    this.canvas.style.right = '8px';
    this.canvas.style.width = `${this.width}px`;
    this.canvas.style.height = `${this.height}px`;
    this.canvas.style.zIndex = '1000';
    this.canvas.style.pointerEvents = 'none';
    this.canvas.width = this.width * devicePixelRatio;
    this.canvas.height = this.height * devicePixelRatio;
    this.ctx = this.canvas.getContext('2d')!;
    this.ctx.scale(devicePixelRatio, devicePixelRatio);
    this.ctx.font = '12px Orbitron, sans-serif';
    parentElement.style.position = parentElement.style.position || 'relative';
    parentElement.appendChild(this.canvas);
  }

  // Called by game loop for each visible item each frame
  updateItem(item: StarItem | DebrisItem, camera: THREE.Camera): void {
    const worldPos = item.root.getWorldPosition(new THREE.Vector3());

    // relative to camera
    const rel = worldPos.clone().sub(camera.position);
    const forward = new THREE.Vector3();
    camera.getWorldDirection(forward).normalize();
    const right = forward.clone().cross(camera.up).normalize();

    const rx = rel.dot(right);
    const rz = rel.dot(forward);

    const range = 120; // world units the radar shows to edge

    const nx = rx / range;
    const ny = rz / range;

    // clamp to circle
    const len = Math.sqrt(nx * nx + ny * ny);
    let cx = nx;
    let cy = ny;
    if (len > 1) {
      cx = nx / len;
      cy = ny / len;
    }

    const canvasX = this.centerX + cx * this.radius;
    const canvasY = this.centerY - cy * this.radius;

    const key = (item as any).root.uuid || String(item);
    const color = item instanceof StarItem ? '#FFD700' : '#FF4444';

    this.entries.set(key, { x: canvasX, y: canvasY, color, timestamp: performance.now() });
  }

  update(delta: number): void {
    this.timeAcc += delta;
    this.sweepAngle += this.sweepSpeed * delta;

    // clear
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.width, this.height);

    // draw background circle
    ctx.save();
    ctx.translate(0.5, 0.5);
    ctx.beginPath();
    ctx.fillStyle = 'rgba(0,20,40,0.85)';
    ctx.arc(this.centerX, this.centerY, this.radius + 6, 0, Math.PI * 2);
    ctx.fill();

    // grid concentric
    ctx.strokeStyle = 'rgba(0,100,60,0.25)';
    ctx.lineWidth = 1;
    for (let r = this.radius / 3; r <= this.radius; r += this.radius / 3) {
      ctx.beginPath();
      ctx.arc(this.centerX, this.centerY, r, 0, Math.PI * 2);
      ctx.stroke();
    }

    // RADAR label
    ctx.fillStyle = '#8EE2A6';
    ctx.textAlign = 'center';
    ctx.fillText('RADAR', this.centerX, 16);

    // center dot
    ctx.beginPath();
    ctx.fillStyle = '#33FF77';
    ctx.arc(this.centerX, this.centerY, 3, 0, Math.PI * 2);
    ctx.fill();

    // sweep line
    const angle = this.sweepAngle;
    const sx = this.centerX + Math.cos(angle) * (this.radius + 6);
    const sy = this.centerY - Math.sin(angle) * (this.radius + 6);
    const grad = ctx.createLinearGradient(this.centerX, this.centerY, sx, sy);
    grad.addColorStop(0, 'rgba(0,255,128,0.25)');
    grad.addColorStop(1, 'rgba(0,255,128,0.0)');
    ctx.beginPath();
    ctx.strokeStyle = grad as unknown as string;
    ctx.lineWidth = 2;
    ctx.moveTo(this.centerX, this.centerY);
    ctx.lineTo(sx, sy);
    ctx.stroke();

    // draw items (only recent ones)
    const now = performance.now();
    this.entries.forEach((entry, key) => {
      if (now - entry.timestamp > this.maxAgeMs) {
        this.entries.delete(key);
        return;
      }

      // pulse
      const pulse = 0.6 + 0.4 * Math.sin(this.timeAcc * 12);
      ctx.beginPath();
      ctx.fillStyle = entry.color;
      ctx.globalAlpha = pulse;
      ctx.arc(entry.x, entry.y, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    });

    ctx.restore();
  }
}
