import type { TextureType, TextureIntensity } from '../types';

// Seeded PRNG for consistent, beautiful procedural patterns
function createRng(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Periodic lattice noise: grid cells wrap end-to-end for 100% seamless tiling
function lattice(G: number, r: () => number) {
  const a = new Float32Array(G * G);
  for (let i = 0; i < a.length; i++) a[i] = r();
  return a;
}

function samp(a: Float32Array, G: number, u: number, v: number) {
  const x0 = u | 0;
  const y0 = v | 0;
  const fx = u - x0;
  const fy = v - y0;
  const x1 = (x0 + 1) % G;
  const y1 = (y0 + 1) % G;
  const sx = fx * fx * (3 - 2 * fx);
  const sy = fy * fy * (3 - 2 * fy);
  const a0 = a[y0 * G + x0];
  const a1 = a[y0 * G + x1];
  const b0 = a[y1 * G + x0];
  const b1 = a[y1 * G + x1];
  return a0 + (a1 - a0) * sx + (b0 + (b1 - b0) * sx - (a0 + (a1 - a0) * sx)) * sy;
}

function circSmooth(len: number, r: () => number, w: number) {
  const q = new Float32Array(len);
  const o = new Float32Array(len);
  for (let i = 0; i < len; i++) q[i] = r() * 2 - 1;
  for (let i = 0; i < len; i++) {
    let s = 0;
    for (let k = -w; k <= w; k++) s += q[(i + k + len) % len];
    o[i] = (s / (2 * w + 1)) * 1.8;
  }
  return o;
}

// In-memory cache for fast, zero-lag retrieval
const textureCache = new Map<string, string>();

interface PresetConfig {
  grain: number;
  depth: number;
  mott: number;
  dens: number;
  alphaMult: number;
}

const PRESETS: Record<
  'paper' | 'linen',
  Record<'light' | 'medium' | 'strong', PresetConfig>
> = {
  paper: {
    light: { grain: 28, depth: 30, mott: 22, dens: 35, alphaMult: 0.5 },
    medium: { grain: 44, depth: 48, mott: 36, dens: 50, alphaMult: 0.9 },
    strong: { grain: 64, depth: 72, mott: 50, dens: 65, alphaMult: 1.45 },
  },
  linen: {
    light: { grain: 26, depth: 38, mott: 20, dens: 40, alphaMult: 0.55 },
    medium: { grain: 38, depth: 56, mott: 30, dens: 55, alphaMult: 1.0 },
    strong: { grain: 56, depth: 80, mott: 42, dens: 70, alphaMult: 1.55 },
  },
};

/**
 * Generates a seamless transparent tile with procedural paper or linen relief
 */
export function getProceduralTexture(
  type: TextureType,
  intensity: TextureIntensity = 'medium',
  isDark = false
): string | null {
  if (type === 'none') return null;
  if (typeof document === 'undefined') return null;

  const cacheKey = `${type}_${intensity}_${isDark ? 'dark' : 'light'}`;
  if (textureCache.has(cacheKey)) {
    return textureCache.get(cacheKey)!;
  }

  const N = 256;
  const s = N / 1024;
  const seed = type === 'paper' ? 20260315 : 20260824;
  const r = createRng(seed);
  const p = PRESETS[type][intensity];

  const cv = document.createElement('canvas');
  cv.width = cv.height = N;
  const ctx = cv.getContext('2d');
  if (!ctx) return null;

  const img = ctx.createImageData(N, N);
  const d = img.data;

  const grain = p.grain / 100;
  const depth = p.depth / 100;
  const mott = p.mott / 100;
  const dn = p.dens / 100;

  // Multi-octave periodic noise
  const mg = [4, 8, 16];
  const mn = mg.map((g) => lattice(g, r));
  const G2 = Math.max(16, Math.round(N / (2 * s)));
  const n2 = lattice(G2, r);

  // Linen warp & weft data
  let T = 0;
  let slH: Float32Array = new Float32Array(0);
  let slV: Float32Array = new Float32Array(0);
  let fbH: Float32Array = new Float32Array(0);
  let fbV: Float32Array = new Float32Array(0);
  let tH: Float32Array = new Float32Array(0);
  let tV: Float32Array = new Float32Array(0);

  if (type === 'linen') {
    T = Math.round(((65 + dn * 100) * N) / 1024);
    slH = new Float32Array(T * T);
    slV = new Float32Array(T * T);
    for (let k = 0; k < T; k++) {
      slH.set(circSmooth(T, r, 2), k * T);
      slV.set(circSmooth(T, r, 2), k * T);
    }
    fbH = new Float32Array(T * 6);
    fbV = new Float32Array(T * 6);
    for (let k = 0; k < fbH.length; k++) {
      fbH[k] = r() * 2 - 1;
      fbV[k] = r() * 2 - 1;
    }
    tH = new Float32Array(T);
    tV = new Float32Array(T);
    for (let k = 0; k < T; k++) {
      tH[k] = r() * 2 - 1;
      tV[k] = r() * 2 - 1;
    }
  }

  const PI = Math.PI;
  const k0 = T / N;
  let o = 0;

  for (let y = 0; y < N; y++) {
    for (let x = 0; x < N; x++) {
      // Low-frequency mottling (cloud pattern)
      let m = 0;
      let amp = 1;
      let tot = 0;
      for (let q = 0; q < 3; q++) {
        m += (samp(mn[q], mg[q], (x / N) * mg[q], (y / N) * mg[q]) - 0.5) * amp;
        tot += amp;
        amp *= 0.5;
      }
      let lum = 1 + ((mott * 0.16 * m) / tot) * 2;

      // Mid-frequency & pixel grain
      lum += grain * 0.07 * (samp(n2, G2, (x / N) * G2, (y / N) * G2) - 0.5) * 2;
      lum += (r() + r() - 1) * grain * 0.08;

      // Linen weave structure
      if (T) {
        const u = x * k0;
        const v = y * k0;
        const i = u | 0;
        const j = v | 0;
        const fu = u - i;
        const fv = v - j;
        const su = Math.sin(PI * fu);
        const sv = Math.sin(PI * fv);
        const hS = Math.sqrt(sv) * (0.78 + 0.22 * su);
        const vS = Math.sqrt(su) * (0.78 + 0.22 * sv);
        const hVar =
          tH[j] * 0.04 + slH[j * T + i] * 0.06 + fbH[j * 6 + ((fv * 6) | 0)] * 0.035;
        const vVar =
          tV[i] * 0.04 + slV[i * T + j] * 0.06 + fbV[i * 6 + ((fu * 6) | 0)] * 0.035;
        const hOn = ((i + j) & 1) === 0;
        const top = hOn ? hS : vS;
        const under = hOn ? vS : hS;
        const sh = Math.max(top, 0.45 * under);
        lum += depth * (0.3 * (sh - 0.62) + (hOn ? hVar : vVar) * 0.88);
      }

      // Convert delta-luminance to transparent RGBA alpha channels
      if (lum > 1.0) {
        // High surface: gentle white/ivory highlight
        const diff = Math.min(0.5, lum - 1.0);
        const alpha = Math.min(255, Math.round(diff * p.alphaMult * 240));
        d[o] = isDark ? 245 : 255;
        d[o + 1] = isDark ? 240 : 255;
        d[o + 2] = isDark ? 230 : 255;
        d[o + 3] = alpha;
      } else {
        // Depressed surface: shadow/crevice
        const diff = Math.min(0.5, 1.0 - lum);
        const alpha = Math.min(255, Math.round(diff * p.alphaMult * 260));
        if (isDark) {
          d[o] = 0;
          d[o + 1] = 0;
          d[o + 2] = 0;
        } else {
          // Warm sepia shadow for rich paper feel
          d[o] = 55;
          d[o + 1] = 38;
          d[o + 2] = 20;
        }
        d[o + 3] = alpha;
      }

      o += 4;
    }
  }

  ctx.putImageData(img, 0, 0);

  // If Paper: draw procedural fiber filaments & tiny kraft impurities
  if (type === 'paper') {
    const PI2 = Math.PI * 2;
    const cnt = Math.round((1200 + dn * 4500) * (N / 1024) ** 2);
    ctx.lineCap = 'round';

    for (let n = 0; n < cnt; n++) {
      const x = r() * N;
      const y = r() * N;
      const L = (10 + r() * r() * 50) * s;
      const a = r() * PI2;
      const b = a + (r() - 0.5) * 1.4;
      const light = r() < 0.55;
      const w = (0.5 + r() * 0.8) * s;
      const al = (light ? 0.09 : 0.065) * (0.3 + depth * 1.2) * (0.4 + r() * 0.8) * p.alphaMult;
      ctx.lineWidth = w;
      if (isDark) {
        ctx.strokeStyle = light
          ? `rgba(255, 245, 230, ${al * 1.2})`
          : `rgba(0, 0, 0, ${al * 0.9})`;
      } else {
        ctx.strokeStyle = light
          ? `rgba(255, 255, 255, ${al * 1.3})`
          : `rgba(90, 65, 35, ${al * 1.4})`;
      }

      const cx = Math.cos(a) * L * 0.5;
      const cy = Math.sin(a) * L * 0.5;
      const ex = cx + Math.cos(b) * L * 0.5;
      const ey = cy + Math.sin(b) * L * 0.5;

      const xs = [0];
      const ys = [0];
      if (x < L) xs.push(N);
      if (x > N - L) xs.push(-N);
      if (y < L) ys.push(N);
      if (y > N - L) ys.push(-N);

      for (const ox of xs) {
        for (const oy of ys) {
          ctx.beginPath();
          ctx.moveTo(x + ox, y + oy);
          ctx.quadraticCurveTo(x + ox + cx, y + oy + cy, x + ox + ex, y + oy + ey);
          ctx.stroke();
        }
      }
    }

    // Rare tiny pulp flecks (kraft specks)
    const sp = Math.round(grain * 180 * (N / 1024) ** 2);
    for (let n = 0; n < sp; n++) {
      const x = r() * N;
      const y = r() * N;
      const rad = (0.4 + r() * r() * 1.4) * s;
      const speckAlpha = (0.06 + r() * 0.14 * depth) * p.alphaMult;
      ctx.fillStyle = isDark
        ? `rgba(250, 240, 220, ${speckAlpha * 0.8})`
        : `rgba(80, 55, 30, ${speckAlpha * 1.3})`;

      for (const ox of x < 4 * s ? [0, N] : x > N - 4 * s ? [0, -N] : [0]) {
        for (const oy of y < 4 * s ? [0, N] : y > N - 4 * s ? [0, -N] : [0]) {
          ctx.beginPath();
          ctx.arc(x + ox, y + oy, rad, 0, PI2);
          ctx.fill();
        }
      }
    }
  }

  const dataUrl = cv.toDataURL('image/png');
  textureCache.set(cacheKey, dataUrl);
  return dataUrl;
}
