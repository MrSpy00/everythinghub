"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";

const perlinVertexShader = `#version 300 es
in vec2 uv;
in vec2 position;
out vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position, 0., 1.);
}`;

const perlinFragmentShader = `#version 300 es
precision mediump float;
uniform float uFrequency;
uniform float uTime;
uniform float uSpeed;
uniform float uValue;
uniform vec2 uResolution;
in vec2 vUv;
out vec4 fragColor;

vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 permute(vec4 x) { return mod289(((x * 34.0) + 1.0) * x); }
vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

float snoise(vec3 v) {
  const vec2  C = vec2(1.0/6.0, 1.0/3.0);
  const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);
  vec3 i  = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min( g.xyz, l.zxy );
  vec3 i2 = max( g.xyz, l.zxy );
  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - D.yyy;
  i = mod289(i);
  vec4 p = permute( permute( permute(
             i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
           + i.y + vec4(0.0, i1.y, i2.y, 1.0 ))
           + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));
  float n_ = 0.142857142857;
  vec3  ns = n_ * D.wyz - D.xzx;
  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_ );
  vec4 x = x_ *ns.x + ns.yyyy;
  vec4 y = y_ *ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);
  vec4 b0 = vec4( x.xy, y.xy );
  vec4 b1 = vec4( x.zw, y.zw );
  vec4 s0 = floor(b0)*2.0 + 1.0;
  vec4 s1 = floor(b1)*2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));
  vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
  vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;
  vec3 p0 = vec3(a0.xy,h.x);
  vec3 p1 = vec3(a0.zw,h.y);
  vec3 p2 = vec3(a1.xy,h.z);
  vec3 p3 = vec3(a1.zw,h.w);
  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
  p0 *= norm.x;
  p1 *= norm.y;
  p2 *= norm.z;
  p3 *= norm.w;
  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
  m = m * m;
  return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3) ) );
}

vec3 hsv2rgb(vec3 c) {
  vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
  vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
  return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

void main() {
  vec2 uv = vUv;
  float aspect = uResolution.x / max(uResolution.y, 1.0);
  uv = (uv - 0.5) * vec2(aspect, 1.0) + 0.5;
  float hue = abs(snoise(vec3(uv * uFrequency, uTime * uSpeed)));
  vec3 rainbowColor = hsv2rgb(vec3(hue, 1.0, uValue));
  fragColor = vec4(rainbowColor, 1.0);
}`;

const dotVertexShader = `#version 300 es
in vec2 uv;
in vec2 position;
out vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position, 0., 1.);
}`;

const dotFragmentShader = `#version 300 es
precision highp float;
uniform vec2 uResolution;
uniform sampler2D uTexture;
uniform int uPaletteCount;
uniform vec3 uPalette[10];
uniform float uPaletteAlpha[10];
uniform float uCellSize;
uniform float uGamma;
uniform float uPaletteBias;
out vec4 fragColor;

void main() {
  vec2 pix = gl_FragCoord.xy;
  float cell = max(uCellSize, 1.0);

  vec2 cellIdx = floor(pix / cell);
  vec2 cellCenter = (cellIdx + 0.5) * cell;
  vec3 col = texture(uTexture, cellCenter / uResolution.xy).rgb;
  float gray = 0.3 * col.r + 0.59 * col.g + 0.11 * col.b;
  gray = pow(clamp(gray, 0.0001, 1.0), uGamma);

  vec2 cellUV = fract(pix / cell) - 0.5;
  float dist = length(cellUV);
  float radius = clamp(gray + uPaletteBias, 0.0, 1.0) * 0.5;
  float aa = fwidth(dist) + 1e-4;
  float mark = 1.0 - smoothstep(radius - aa, radius + aa, dist);

  float g2 = clamp(gray + uPaletteBias, 0.0, 1.0);
  int cnt = max(uPaletteCount, 1);
  vec3 dotCol;
  float dotOpacity;
  if (cnt <= 1) {
    dotCol = uPalette[0];
    dotOpacity = uPaletteAlpha[0];
  } else {
    float scaled = g2 * float(cnt - 1);
    int seg = int(floor(scaled));
    seg = clamp(seg, 0, cnt - 2);
    float f = clamp(scaled - float(seg), 0.0, 1.0);
    dotCol = mix(uPalette[seg], uPalette[seg + 1], f);
    dotOpacity = mix(uPaletteAlpha[seg], uPaletteAlpha[seg + 1], f);
  }

  fragColor = vec4(dotCol * dotOpacity, mark * dotOpacity);
}`;

function parseCssColor(css: string): [number, number, number, number] {
  const c = css.trim().toLowerCase();
  if (c.startsWith("#")) {
    let hex = c.slice(1);
    if (hex.length === 3 || hex.length === 4) {
      hex = hex.split("").map((x) => x + x).join("");
    }
    const r = parseInt(hex.slice(0, 2), 16) / 255;
    const g = parseInt(hex.slice(2, 4), 16) / 255;
    const b = parseInt(hex.slice(4, 6), 16) / 255;
    const a = hex.length >= 8 ? parseInt(hex.slice(6, 8), 16) / 255 : 1.0;
    return [r, g, b, a];
  }
  if (c.startsWith("rgba") || c.startsWith("rgb")) {
    const parts = c.replace(/rgba?\(|\)/g, "").split(",").map((s) => parseFloat(s.trim()));
    return [
      parts[0] / 255,
      parts[1] / 255,
      parts[2] / 255,
      parts.length > 3 ? parts[3] : 1.0,
    ];
  }
  return [0.5, 0.5, 0.5, 1.0];
}

function buildPaletteUniforms(colors: string[]) {
  const maxColors = 10;
  const rgbFlat: number[] = [];
  const alphaArr: number[] = [];
  const count = Math.min(colors.length, maxColors);

  for (let i = 0; i < maxColors; i++) {
    if (i < count) {
      const [r, g, b, a] = parseCssColor(colors[i]);
      rgbFlat.push(r, g, b);
      alphaArr.push(a);
    } else {
      rgbFlat.push(0, 0, 0);
      alphaArr.push(0);
    }
  }
  return { rgb: rgbFlat, alpha: alphaArr };
}

export interface DottedBackgroundProps {
  frequency?: number;
  speed?: number;
  cellSize?: number;
  gamma?: number;
  paletteBias?: number;
  colors?: string[];
  bgColor?: string;
  className?: string;
  style?: CSSProperties;
}

export function DottedBackground({
  frequency = 0.35,
  speed = 0.15,
  cellSize = 26,
  gamma = 1.1,
  paletteBias = 0.1,
  colors = [
    "rgba(139, 92, 246, 0.35)",
    "rgba(99, 102, 241, 0.30)",
    "rgba(16, 185, 129, 0.25)",
    "rgba(245, 158, 11, 0.20)",
  ],
  bgColor = "#09090b",
  className,
  style,
}: DottedBackgroundProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const isVisibleRef = useRef<boolean>(true);
  const rafIdRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || typeof window === "undefined") return;

    // Check if touch / mobile device to prevent high CPU WebGL loops on mobile
    const isMobile = window.matchMedia && window.matchMedia("(pointer: coarse)").matches;
    if (isMobile) return;

    let cleanup = () => {};

    // Defer dynamic OGL WebGL import & setup until idle to guarantee 0 blocking time
    const initWebGL = async () => {
      try {
        const { Renderer, Camera, Mesh, Plane, Program, RenderTarget: OglRenderTarget } = await import("ogl");

        const renderer = new Renderer({
          dpr: Math.min(window.devicePixelRatio || 1, 1.25),
          alpha: true,
          premultipliedAlpha: false,
          powerPreference: "low-power",
        });

        const gl = renderer.gl;
        const canvas = gl.canvas;
        canvas.style.display = "block";
        canvas.style.width = "100%";
        canvas.style.height = "100%";
        canvas.style.position = "absolute";
        canvas.style.inset = "0";
        canvas.style.pointerEvents = "none";
        container.appendChild(canvas);

        const camera = new Camera(gl);

        const doResize = () => {
          if (!container) return;
          const rect = container.getBoundingClientRect();
          const w = Math.max(10, rect.width);
          const h = Math.max(10, rect.height);
          renderer.setSize(w, h);
        };

        window.addEventListener("resize", doResize, { passive: true });
        doResize();

        const perlinProgram = new Program(gl, {
          vertex: perlinVertexShader,
          fragment: perlinFragmentShader,
          uniforms: {
            uTime: { value: 0 },
            uFrequency: { value: frequency * 0.35 },
            uSpeed: { value: speed * 0.04 },
            uValue: { value: 1 },
            uResolution: { value: [canvas.width, canvas.height] },
          },
        });

        const perlinMesh = new Mesh(gl, {
          geometry: new Plane(gl, { width: 2, height: 2 }),
          program: perlinProgram,
        });

        const renderTarget = new OglRenderTarget(gl);
        const palette = buildPaletteUniforms(colors);

        const dotProgram = new Program(gl, {
          vertex: dotVertexShader,
          fragment: dotFragmentShader,
          uniforms: {
            uResolution: { value: [canvas.width, canvas.height] },
            uTexture: { value: renderTarget.texture },
            uPaletteCount: { value: Math.min(10, colors.length) },
            uPalette: { value: palette.rgb },
            uPaletteAlpha: { value: palette.alpha },
            uCellSize: { value: cellSize * 0.75 },
            uGamma: { value: gamma },
            uPaletteBias: { value: paletteBias * 0.05 },
          },
        });

        const dotMesh = new Mesh(gl, {
          geometry: new Plane(gl, { width: 2, height: 2 }),
          program: dotProgram,
        });

        const onVisibilityChange = () => {
          isVisibleRef.current = document.visibilityState === "visible";
        };
        document.addEventListener("visibilitychange", onVisibilityChange, { passive: true });

        let observer: IntersectionObserver | null = null;
        if (typeof IntersectionObserver !== "undefined") {
          observer = new IntersectionObserver(
            (entries) => {
              entries.forEach((entry) => {
                isVisibleRef.current = entry.isIntersecting && document.visibilityState === "visible";
              });
            },
            { threshold: 0 }
          );
          observer.observe(container);
        }

        const frameInterval = 80; // Smooth 12.5fps throttled ambient calculation saving CPU & GPU
        const update = (time: number) => {
          rafIdRef.current = requestAnimationFrame(update);
          if (!isVisibleRef.current) return;

          const last = lastTimeRef.current;
          if (time - last >= frameInterval) {
            lastTimeRef.current = time;
            perlinProgram.uniforms.uTime.value = time * 0.001;
            renderer.render({ scene: perlinMesh, camera, target: renderTarget });
            dotProgram.uniforms.uResolution.value = [canvas.width, canvas.height];
            perlinProgram.uniforms.uResolution.value = [canvas.width, canvas.height];
            renderer.render({ scene: dotMesh, camera });
          }
        };

        rafIdRef.current = requestAnimationFrame(update);

        cleanup = () => {
          if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
          window.removeEventListener("resize", doResize);
          document.removeEventListener("visibilitychange", onVisibilityChange);
          if (observer) observer.disconnect();
          if (canvas && canvas.parentElement === container) {
            container.removeChild(canvas);
          }
        };
      } catch {}
    };

    let idleId: number | null = null;
    let timer: NodeJS.Timeout | null = null;

    if ("requestIdleCallback" in window) {
      idleId = (window as any).requestIdleCallback(() => initWebGL(), { timeout: 3000 });
    } else {
      timer = setTimeout(initWebGL, 2000);
    }

    return () => {
      if (idleId && "cancelIdleCallback" in window) (window as any).cancelIdleCallback(idleId);
      if (timer) clearTimeout(timer);
      cleanup();
    };
  }, [frequency, speed, cellSize, gamma, paletteBias, colors]);

  return (
    <div
      ref={containerRef}
      className={`fixed inset-0 pointer-events-none -z-10 overflow-hidden opacity-40 transition-opacity duration-1000 ${
        className || ""
      }`}
      style={{
        background: bgColor,
        ...style,
      }}
    >
      {/* Mobile Ambient Glow - 0ms CPU Cost with GPU Compositing */}
      <div
        className="absolute inset-0 pointer-events-none opacity-25"
        style={{
          background:
            "radial-gradient(ellipse 80% 50% at 50% -20%, rgba(139,92,246,0.35), transparent 70%), radial-gradient(ellipse 60% 40% at 80% 60%, rgba(99,102,241,0.25), transparent 60%)",
        }}
      />
    </div>
  );
}
