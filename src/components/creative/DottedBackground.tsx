"use client";

import { useEffect, useRef, type CSSProperties } from "react";
import {
  Renderer,
  Camera,
  Mesh,
  Plane,
  Program,
  RenderTarget as OglRenderTarget,
} from "ogl";

const INTRINSIC_WIDTH = 600;
const INTRINSIC_HEIGHT = 600;

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
  fragColor = vec4(dotCol, mark * dotOpacity);
}`;

type Rgba = { r: number; g: number; b: number; a: number };

function parseColorToRgba(input: string): Rgba {
  if (!input) return { r: 0, g: 0, b: 0, a: 1 };
  const str = input.trim();
  const hex = str.replace(/^#/, "");
  if (hex.length === 6) {
    return {
      r: parseInt(hex.slice(0, 2), 16) / 255,
      g: parseInt(hex.slice(2, 4), 16) / 255,
      b: parseInt(hex.slice(4, 6), 16) / 255,
      a: 1,
    };
  }
  return { r: 0.6, g: 0.4, b: 0.9, a: 0.35 };
}

function buildPaletteUniforms(colorList: string[]) {
  const rgb: [number, number, number][] = [];
  const alpha: number[] = [];
  for (let i = 0; i < 10; i++) {
    const src = colorList[i];
    if (src != null) {
      const c = parseColorToRgba(src);
      rgb.push([c.r, c.g, c.b]);
      alpha.push(c.a);
    } else {
      rgb.push([0, 0, 0]);
      alpha.push(0);
    }
  }
  return { rgb, alpha };
}

interface DottedBackgroundProps {
  frequency?: number;
  speed?: number;
  bgColor?: string;
  colors?: string[];
  cellSize?: number;
  gamma?: number;
  paletteBias?: number;
  style?: CSSProperties;
  className?: string;
}

const DEFAULT_PALETTE = [
  "#6366f1", // Indigo
  "#8b5cf6", // Violet
  "#a855f7", // Purple
  "#ec4899", // Rose
];

export function DottedBackground({
  frequency = 2.4,
  speed = 2.5,
  bgColor = "transparent",
  colors = DEFAULT_PALETTE,
  cellSize = 36,
  gamma = 5,
  paletteBias = -2.5,
  style,
  className,
}: DottedBackgroundProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const perlinProgramRef = useRef<Program | null>(null);
  const dotProgramRef = useRef<Program | null>(null);
  const rendererRef = useRef<Renderer | null>(null);
  const cameraRef = useRef<Camera | null>(null);
  const perlinMeshRef = useRef<Mesh | null>(null);
  const dotMeshRef = useRef<Mesh | null>(null);
  const renderTargetRef = useRef<OglRenderTarget | null>(null);
  const glRef = useRef<Renderer["gl"] | null>(null);
  const rafIdRef = useRef<number | null>(null);
  const lastTimeRef = useRef(0);
  const isVisibleRef = useRef(true);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let renderer: Renderer;
    try {
      renderer = new Renderer({
        dpr: 1.0,
        alpha: true,
        premultipliedAlpha: false,
        webgl: 2,
      });
    } catch {
      return;
    }

    const glContext = renderer.gl as unknown as {
      canvas: HTMLCanvasElement;
    } & WebGL2RenderingContext;
    const gl = renderer.gl;
    const canvas = glContext?.canvas;
    if (!gl || !canvas) return;

    canvas.style.width = "100%";
    canvas.style.height = "100%";
    canvas.style.objectFit = "cover";

    container.appendChild(canvas);
    rendererRef.current = renderer;
    glRef.current = gl;

    const camera = new Camera(gl, { near: 0.1, far: 100 });
    camera.position.set(0, 0, 3);
    cameraRef.current = camera;

    const doResize = () => {
      const width = container.clientWidth || window.innerWidth;
      const height = container.clientHeight || window.innerHeight;
      const aspect = width / Math.max(1, height);

      const dpr = Math.min(typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1, 1.0);
      renderer.dpr = dpr;

      renderer.setSize(width, height);
      camera.perspective({ aspect });
      if (renderTargetRef.current?.setSize) {
        renderTargetRef.current.setSize(canvas.width, canvas.height);
      }
      if (perlinProgramRef.current) {
        perlinProgramRef.current.uniforms.uResolution.value = [
          canvas.width,
          canvas.height,
        ];
      }
      if (dotProgramRef.current) {
        dotProgramRef.current.uniforms.uResolution.value = [
          canvas.width,
          canvas.height,
        ];
      }
    };

    window.addEventListener("resize", doResize);
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
    perlinProgramRef.current = perlinProgram;

    const perlinMesh = new Mesh(gl, {
      geometry: new Plane(gl, { width: 2, height: 2 }),
      program: perlinProgram,
    });
    perlinMeshRef.current = perlinMesh;

    const renderTarget = new OglRenderTarget(gl);
    renderTargetRef.current = renderTarget;

    const isMobile = typeof window !== "undefined" && window.innerWidth < 640;
    const effectiveCellSize = isMobile ? Math.max(18, cellSize * 0.55) : cellSize * 0.7;

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
        uCellSize: { value: effectiveCellSize },
        uGamma: { value: gamma },
        uPaletteBias: { value: paletteBias * 0.05 },
      },
    });
    dotProgramRef.current = dotProgram;

    const dotMesh = new Mesh(gl, {
      geometry: new Plane(gl, { width: 2, height: 2 }),
      program: dotProgram,
    });
    dotMeshRef.current = dotMesh;

    const onVisibilityChange = () => {
      isVisibleRef.current = document.visibilityState === "visible";
    };
    document.addEventListener("visibilitychange", onVisibilityChange);

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

    const frameInterval = 50;
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

    const startTimer = setTimeout(() => {
      rafIdRef.current = requestAnimationFrame(update);
    }, 150);

    return () => {
      clearTimeout(startTimer);
      if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
      window.removeEventListener("resize", doResize);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      if (observer) observer.disconnect();
      if (canvas && canvas.parentElement === container) {
        container.removeChild(canvas);
      }
    };
  }, [frequency, speed, cellSize, gamma, paletteBias, colors]);

  return (
    <div
      ref={containerRef}
      className={`fixed inset-0 pointer-events-none -z-10 overflow-hidden opacity-45 transition-opacity duration-1000 ${
        className || ""
      }`}
      style={{
        background: bgColor,
        ...style,
      }}
    >
      <div
        style={{
          width: `${INTRINSIC_WIDTH}px`,
          height: `${INTRINSIC_HEIGHT}px`,
          visibility: "hidden",
          position: "absolute",
        }}
      />
    </div>
  );
}
