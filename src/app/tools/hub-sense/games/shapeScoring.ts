/**
 * HubSense — Shape Scoring Engine
 * Combines IoU (Intersection over Union), rotation error, and scale error.
 * Shapes: circle, triangle, square, pentagon, hexagon, star.
 */

export type ShapeType = "circle" | "triangle" | "square" | "pentagon" | "hexagon" | "star";

export interface ShapeParams {
  type: ShapeType;
  x: number; // 0-1 normalized canvas position
  y: number; // 0-1 normalized canvas position
  scale: number; // 0.3-1.5 relative to canvas
  rotation: number; // 0-360 degrees
  color?: string;
}

// ─── IoU via rasterized canvas ────────────────────────────────────────────────
const RASTER_SIZE = 256;

function rasterize(params: ShapeParams): Uint8Array {
  if (typeof document === "undefined") return new Uint8Array(RASTER_SIZE * RASTER_SIZE);
  const canvas = document.createElement("canvas");
  canvas.width = RASTER_SIZE;
  canvas.height = RASTER_SIZE;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, RASTER_SIZE, RASTER_SIZE);
  drawShape(ctx, params, RASTER_SIZE);
  const data = ctx.getImageData(0, 0, RASTER_SIZE, RASTER_SIZE).data;
  // Convert to binary mask (non-black = 1)
  const mask = new Uint8Array(RASTER_SIZE * RASTER_SIZE);
  for (let i = 0; i < mask.length; i++) {
    mask[i] = data[i * 4] > 128 ? 1 : 0;
  }
  return mask;
}

function computeIoU(maskA: Uint8Array, maskB: Uint8Array): number {
  let intersection = 0, union = 0;
  for (let i = 0; i < maskA.length; i++) {
    const a = maskA[i], b = maskB[i];
    if (a === 1 || b === 1) union++;
    if (a === 1 && b === 1) intersection++;
  }
  return union === 0 ? 1 : intersection / union;
}

// ─── Shape Drawing ────────────────────────────────────────────────────────────
export function drawShape(
  ctx: CanvasRenderingContext2D,
  params: ShapeParams,
  canvasSize: number
): void {
  const cx = params.x * canvasSize;
  const cy = params.y * canvasSize;
  const r = params.scale * canvasSize * 0.2;
  const rot = (params.rotation * Math.PI) / 180;

  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(rot);
  ctx.fillStyle = params.color || "#fff";
  ctx.beginPath();

  switch (params.type) {
    case "circle":
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      break;
    case "triangle":
      polygon(ctx, 3, r);
      break;
    case "square":
      polygon(ctx, 4, r, Math.PI / 4);
      break;
    case "pentagon":
      polygon(ctx, 5, r);
      break;
    case "hexagon":
      polygon(ctx, 6, r);
      break;
    case "star":
      star(ctx, r * 0.4, r, 5);
      break;
  }

  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function polygon(ctx: CanvasRenderingContext2D, sides: number, r: number, offset = 0): void {
  for (let i = 0; i < sides; i++) {
    const angle = (i * 2 * Math.PI) / sides - Math.PI / 2 + offset;
    if (i === 0) ctx.moveTo(Math.cos(angle) * r, Math.sin(angle) * r);
    else ctx.lineTo(Math.cos(angle) * r, Math.sin(angle) * r);
  }
}

function star(ctx: CanvasRenderingContext2D, innerR: number, outerR: number, points: number): void {
  for (let i = 0; i < points * 2; i++) {
    const angle = (i * Math.PI) / points - Math.PI / 2;
    const r = i % 2 === 0 ? outerR : innerR;
    if (i === 0) ctx.moveTo(Math.cos(angle) * r, Math.sin(angle) * r);
    else ctx.lineTo(Math.cos(angle) * r, Math.sin(angle) * r);
  }
}

// ─── Score Calculation ────────────────────────────────────────────────────────
export interface ShapeScoreResult {
  score: number; // 0-10
  iou: number; // 0-1
  rotationError: number; // degrees
  scaleError: number; // relative
  positionError: number; // 0-1 normalized
  percentAccuracy: number;
  breakdown: {
    iouScore: number;
    rotationScore: number;
    scaleScore: number;
    positionScore: number;
  };
}

export function scoreShape(target: ShapeParams, guess: ShapeParams): ShapeScoreResult {
  // IoU (only if same shape type, else penalize)
  let iou = 0;
  if (target.type === guess.type) {
    const maskA = rasterize(target);
    const maskB = rasterize(guess);
    iou = computeIoU(maskA, maskB);
  }

  // Rotation error (0-180 normalized, symmetry-aware)
  const rotDiff = Math.min(
    Math.abs(target.rotation - guess.rotation),
    360 - Math.abs(target.rotation - guess.rotation)
  );
  const rotError = rotDiff > 180 ? 360 - rotDiff : rotDiff;
  const rotScore = Math.max(0, 1 - rotError / 180);

  // Scale error
  const scaleErr = Math.abs(target.scale - guess.scale) / Math.max(target.scale, 0.1);
  const scaleScore = Math.max(0, 1 - scaleErr * 2);

  // Position error
  const posErr = Math.sqrt(
    Math.pow(target.x - guess.x, 2) + Math.pow(target.y - guess.y, 2)
  );
  const posScore = Math.max(0, 1 - posErr * 2.5);

  // Weighted combination
  const WEIGHTS = { iou: 0.40, rotation: 0.25, scale: 0.20, position: 0.15 };
  const combined =
    iou * WEIGHTS.iou +
    rotScore * WEIGHTS.rotation +
    scaleScore * WEIGHTS.scale +
    posScore * WEIGHTS.position;

  const score = parseFloat((combined * 10).toFixed(2));

  return {
    score,
    iou: parseFloat(iou.toFixed(3)),
    rotationError: parseFloat(rotError.toFixed(1)),
    scaleError: parseFloat(scaleErr.toFixed(3)),
    positionError: parseFloat(posErr.toFixed(3)),
    percentAccuracy: parseFloat(((score / 10) * 100).toFixed(1)),
    breakdown: {
      iouScore: parseFloat((iou * 10).toFixed(2)),
      rotationScore: parseFloat((rotScore * 10).toFixed(2)),
      scaleScore: parseFloat((scaleScore * 10).toFixed(2)),
      positionScore: parseFloat((posScore * 10).toFixed(2)),
    },
  };
}

// ─── Shape Generation ─────────────────────────────────────────────────────────
const SHAPES: ShapeType[] = ["circle", "triangle", "square", "pentagon", "hexagon", "star"];

export function generateShape(
  seed: number,
  roundIndex: number,
  difficulty: "easy" | "hard" | "brutal"
): ShapeParams {
  const rng = (offset: number) =>
    (Math.sin(seed * 1234.5 + roundIndex * 567.8 + offset) * 0.5 + 0.5);

  const shapeIndex = Math.floor(rng(0) * SHAPES.length);
  const type = SHAPES[shapeIndex];

  const posRange = difficulty === "easy" ? 0.2 : difficulty === "hard" ? 0.3 : 0.4;
  const x = 0.5 + (rng(1) - 0.5) * posRange;
  const y = 0.5 + (rng(2) - 0.5) * posRange;

  const scaleMin = difficulty === "easy" ? 0.5 : difficulty === "hard" ? 0.4 : 0.3;
  const scaleMax = difficulty === "easy" ? 1.0 : difficulty === "hard" ? 1.2 : 1.5;
  const scale = scaleMin + rng(3) * (scaleMax - scaleMin);

  const rotMax = difficulty === "easy" ? 90 : difficulty === "hard" ? 180 : 360;
  const rotation = rng(4) * rotMax;

  return { type, x, y, scale, rotation };
}
