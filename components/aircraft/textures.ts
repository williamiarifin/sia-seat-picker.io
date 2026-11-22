"use client";

import * as THREE from "three";

/**
 * Procedural livery textures. Everything is drawn on a <canvas> at runtime and
 * cached at module scope — no network requests, no binary assets.
 *
 * UV convention for the fuselage shell:
 *   u = (PI - phi) / 2PI   (phi = 0 at the roof, +PI/2 starboard, PI at the belly)
 *   v = (z - noseZ) / length
 * The canvas therefore runs nose -> tail from bottom to top. u = 0 / 1 is the
 * belly centreline and u = 0.5 is the crown, so the wrap is seamless.
 */

const NOSE_Z = -19.75;
const TAIL_Z = 19.75;
const LENGTH = TAIL_Z - NOSE_Z;

const IVORY = "#F4F1E8";
const NAVY = "#0A1B33";
const GOLD = "#C9A24D";
const GOLD_LIGHT = "#F2D493";

const cache = new Map<string, THREE.Texture>();

function make2D(
  width: number,
  height: number,
): { canvas: HTMLCanvasElement; ctx: CanvasRenderingContext2D } | null {
  if (typeof document === "undefined") return null;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  return { canvas, ctx };
}

function finalize(canvas: HTMLCanvasElement, srgb: boolean, repeatX: boolean): THREE.CanvasTexture {
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = srgb ? THREE.SRGBColorSpace : THREE.NoColorSpace;
  texture.wrapS = repeatX ? THREE.RepeatWrapping : THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.anisotropy = 8;
  texture.needsUpdate = true;
  return texture;
}

function mulberry32(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function roundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
): void {
  const r = Math.max(0, Math.min(radius, width / 2, height / 2));
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + width - r, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + r);
  ctx.lineTo(x + width, y + height - r);
  ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
  ctx.lineTo(x + r, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

/* -------------------------------------------------------------------------- */
/* Fuselage livery                                                            */
/* -------------------------------------------------------------------------- */

function createFuselageMap(): THREE.CanvasTexture | null {
  const surface = make2D(1024, 2048);
  if (!surface) return null;
  const { canvas, ctx } = surface;
  const W = canvas.width;
  const H = canvas.height;
  const random = mulberry32(0x51a7b3);

  const zToY = (z: number) => H * (1 - (z - NOSE_Z) / LENGTH);

  /* Base paint ------------------------------------------------------------- */
  ctx.fillStyle = IVORY;
  ctx.fillRect(0, 0, W, H);

  const sheen = ctx.createLinearGradient(0, 0, 0, H);
  sheen.addColorStop(0, "rgba(255,255,255,0.10)");
  sheen.addColorStop(0.42, "rgba(255,255,255,0)");
  sheen.addColorStop(1, "rgba(150,158,166,0.10)");
  ctx.fillStyle = sheen;
  ctx.fillRect(0, 0, W, H);

  /* Frame / panel lines ---------------------------------------------------- */
  ctx.strokeStyle = "rgba(106,114,122,0.13)";
  ctx.lineWidth = 1;
  for (let z = -19.1; z < 19.4; z += 0.61) {
    const y = zToY(z);
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(W, y);
    ctx.stroke();
  }
  ctx.strokeStyle = "rgba(106,114,122,0.07)";
  for (const u of [0.085, 0.155, 0.335, 0.5, 0.665, 0.845, 0.915]) {
    ctx.beginPath();
    ctx.moveTo(u * W, zToY(-19.2));
    ctx.lineTo(u * W, zToY(19.3));
    ctx.stroke();
  }

  /* Faint dirt in the belly and behind the gear --------------------------- */
  ctx.strokeStyle = "rgba(110,116,120,0.06)";
  for (let i = 0; i < 70; i += 1) {
    const x = (random() < 0.5 ? random() * 0.11 : 0.89 + random() * 0.11) * W;
    const z = -13 + random() * 30;
    const len = 0.4 + random() * 2.2;
    ctx.beginPath();
    ctx.moveTo(x, zToY(z));
    ctx.lineTo(x + (random() - 0.5) * 8, zToY(Math.min(19.3, z + len)));
    ctx.stroke();
  }

  /* Navy tail with a curved forward edge ----------------------------------- */
  const tailBoundary = (u: number) => 12.55 + 2.45 * Math.abs(2 * u - 1);
  const tailPath = () => {
    ctx.beginPath();
    ctx.moveTo(0, 0);
    for (let x = 0; x <= W; x += 8) {
      ctx.lineTo(x, zToY(tailBoundary(x / W)));
    }
    ctx.lineTo(W, 0);
    ctx.closePath();
  };
  tailPath();
  const navyFill = ctx.createLinearGradient(0, 0, 0, zToY(12.5));
  navyFill.addColorStop(0, "#0D2642");
  navyFill.addColorStop(0.5, "#0A1B33");
  navyFill.addColorStop(1, "#081426");
  ctx.fillStyle = navyFill;
  ctx.fill();

  /* Soft grey belly -------------------------------------------------------- */
  const bellyStarboard = ctx.createLinearGradient(0, 0, W * 0.19, 0);
  bellyStarboard.addColorStop(0, "#C4CBCF");
  bellyStarboard.addColorStop(0.38, "#D6DBDC");
  bellyStarboard.addColorStop(1, "rgba(214,219,220,0)");
  ctx.fillStyle = bellyStarboard;
  ctx.fillRect(0, 0, W * 0.19, H);

  const bellyPort = ctx.createLinearGradient(W, 0, W * 0.81, 0);
  bellyPort.addColorStop(0, "#C4CBCF");
  bellyPort.addColorStop(0.38, "#D6DBDC");
  bellyPort.addColorStop(1, "rgba(214,219,220,0)");
  ctx.fillStyle = bellyPort;
  ctx.fillRect(W * 0.81, 0, W * 0.19, H);

  /* Gold pinstripe following the tail sweep -------------------------------- */
  ctx.beginPath();
  for (let x = 0; x <= W; x += 8) {
    const y = zToY(tailBoundary(x / W));
    if (x === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.strokeStyle = "rgba(201,162,77,0.75)";
  ctx.lineWidth = 2.5;
  ctx.stroke();

  /* Gold cheatline running nose to tail ------------------------------------ */
  const yTop = zToY(19.45);
  const yBottom = zToY(-18.7);
  const drawCheatline = (centerX: number) => {
    ctx.fillStyle = "#A9822F";
    ctx.fillRect(centerX - 4, yTop, 8, yBottom - yTop);
    ctx.fillStyle = GOLD;
    ctx.fillRect(centerX - 3, yTop, 6, yBottom - yTop);
    ctx.fillStyle = "rgba(255,244,208,0.55)";
    ctx.fillRect(centerX - 2.6, yTop, 1.4, yBottom - yTop);
    ctx.fillStyle = "rgba(10,27,51,0.8)";
    ctx.fillRect(centerX + 3, yTop, 1.1, yBottom - yTop);
  };

  /* Cabin windows ---------------------------------------------------------- */
  const doors = [
    { z: -12.9, width: 0.95 },
    { z: 8.25, width: 0.95 },
    { z: -2.5, width: 0.5 },
    { z: -1.6, width: 0.5 },
  ];
  const nearDoor = (z: number) =>
    doors.some((door) => Math.abs(z - door.z) < door.width / 2 + 0.18);

  for (const u of [0.25, 0.75]) {
    const cx = u * W;
    for (let z = -12.1; z <= 7.5; z += 0.53) {
      if (nearDoor(z)) continue;
      const cy = zToY(z);
      ctx.fillStyle = "rgba(120,128,134,0.45)";
      roundedRect(ctx, cx - 13.5, cy - 7.5, 27, 15, 6);
      ctx.fill();
      ctx.fillStyle = "#18232C";
      roundedRect(ctx, cx - 11.5, cy - 6.3, 23, 12.6, 5);
      ctx.fill();
      const glint = ctx.createLinearGradient(cx - 11, cy - 6, cx + 11, cy + 6);
      glint.addColorStop(0, "rgba(166,201,224,0.55)");
      glint.addColorStop(0.45, "rgba(80,112,134,0.12)");
      glint.addColorStop(1, "rgba(9,20,30,0)");
      ctx.fillStyle = glint;
      roundedRect(ctx, cx - 10.5, cy - 5.4, 21, 10.8, 4.5);
      ctx.fill();
    }
  }

  /* Passenger doors + overwing exits -------------------------------------- */
  const drawDoor = (side: "port" | "starboard", z: number, width: number, main: boolean) => {
    const uLeft = main ? (side === "starboard" ? 0.171 : 0.666) : side === "starboard" ? 0.205 : 0.705;
    const uRight = main ? (side === "starboard" ? 0.334 : 0.829) : side === "starboard" ? 0.295 : 0.795;
    const x = uLeft * W;
    const w = (uRight - uLeft) * W;
    const y = zToY(z + width / 2);
    const h = zToY(z - width / 2) - y;

    ctx.fillStyle = "rgba(244,241,232,0.94)";
    roundedRect(ctx, x, y, w, h, 9);
    ctx.fill();
    ctx.strokeStyle = "rgba(150,157,163,0.85)";
    ctx.lineWidth = 2.4;
    ctx.stroke();
    ctx.strokeStyle = "rgba(255,255,255,0.65)";
    ctx.lineWidth = 1;
    roundedRect(ctx, x + 3, y + 3, w - 6, h - 6, 7);
    ctx.stroke();

    /* Door porthole, set higher than the cabin windows */
    const wx = side === "starboard" ? 0.302 * W : 0.698 * W;
    const wy = zToY(z);
    ctx.fillStyle = "#1A2731";
    roundedRect(ctx, wx - 8, wy - 7, 16, 14, 6);
    ctx.fill();

    if (main) {
      ctx.strokeStyle = "rgba(150,157,163,0.55)";
      ctx.lineWidth = 1.5;
      const gx = side === "starboard" ? 0.258 * W : 0.742 * W;
      ctx.beginPath();
      ctx.moveTo(gx, y + 14);
      ctx.lineTo(gx, y + h - 14);
      ctx.stroke();
    }
  };

  for (const side of ["port", "starboard"] as const) {
    for (const door of doors) {
      drawDoor(side, door.z, door.width, door.z !== -2.5 && door.z !== -1.6);
    }
  }

  /* Cheatline last so it continues across the doors, as on a real airframe. */
  drawCheatline(0.216 * W);
  drawCheatline(0.784 * W);

  /* Registration near the tail -------------------------------------------- */
  const drawRegistration = (x: number, z: number) => {
    ctx.save();
    ctx.translate(x, zToY(z));
    ctx.rotate(x < W / 2 ? Math.PI / 2 : -Math.PI / 2);
    ctx.font = "700 30px ui-sans-serif, system-ui, -apple-system, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "rgba(0,0,0,0.18)";
    ctx.fillText("9V-MBA", 1.5, 1.5);
    ctx.fillStyle = "#F4F1E8";
    ctx.fillText("9V-MBA", 0, 0);
    ctx.restore();
  };
  drawRegistration(0.25 * W, 15.4);
  drawRegistration(0.75 * W, 15.4);

  /* Abstract wordmark above the windows ----------------------------------- */
  const drawWordmark = (x: number, z: number) => {
    ctx.save();
    ctx.translate(x, zToY(z));
    ctx.rotate(x < W / 2 ? Math.PI / 2 : -Math.PI / 2);
    ctx.font = "600 17px ui-sans-serif, system-ui, -apple-system, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "rgba(10,27,51,0.82)";
    ctx.fillText("S I L V E R K R I S", 0, 0);
    ctx.restore();
  };
  drawWordmark(0.3 * W, -9.4);
  drawWordmark(0.7 * W, -9.4);

  /* Cockpit band ----------------------------------------------------------- */
  const cockpitY = zToY(-17.0);
  const cockpitH = zToY(-18.55) - cockpitY;
  ctx.fillStyle = "#101C26";
  roundedRect(ctx, 0.352 * W, cockpitY + 2, 0.296 * W, cockpitH - 4, 14);
  ctx.fill();
  const cockpitGlint = ctx.createLinearGradient(0, cockpitY, 0, cockpitY + cockpitH);
  cockpitGlint.addColorStop(0, "rgba(150,192,222,0.30)");
  cockpitGlint.addColorStop(0.5, "rgba(64,94,116,0.10)");
  cockpitGlint.addColorStop(1, "rgba(4,12,20,0)");
  ctx.fillStyle = cockpitGlint;
  roundedRect(ctx, 0.355 * W, cockpitY + 4, 0.29 * W, cockpitH - 8, 12);
  ctx.fill();
  ctx.strokeStyle = "rgba(244,241,232,0.85)";
  ctx.lineWidth = 3;
  for (const u of [0.415, 0.5, 0.585]) {
    ctx.beginPath();
    ctx.moveTo(u * W, cockpitY + 7);
    ctx.lineTo(u * W, cockpitY + cockpitH - 7);
    ctx.stroke();
  }

  /* Radome ---------------------------------------------------------------- */
  ctx.fillStyle = "#E2E2DF";
  const radomeTop = zToY(-19.35);
  ctx.fillRect(0, radomeTop, W, H - radomeTop);

  /* Very light paint mottling --------------------------------------------- */
  for (let i = 0; i < 900; i += 1) {
    const x = random() * W;
    const y = random() * H;
    ctx.fillStyle = random() < 0.5 ? "rgba(255,255,255,0.035)" : "rgba(90,95,100,0.025)";
    ctx.fillRect(x, y, 1 + random() * 2.5, 1 + random() * 2.5);
  }

  return finalize(canvas, true, true);
}

/* -------------------------------------------------------------------------- */
/* Paint roughness                                                            */
/* -------------------------------------------------------------------------- */

function createRoughnessMap(): THREE.CanvasTexture | null {
  const surface = make2D(512, 512);
  if (!surface) return null;
  const { canvas, ctx } = surface;
  const W = canvas.width;
  const H = canvas.height;
  const image = ctx.createImageData(W, H);
  const random = mulberry32(0x2f61c9);

  for (let y = 0; y < H; y += 1) {
    for (let x = 0; x < W; x += 1) {
      const grain = random();
      const streak = Math.sin(y * 0.085 + x * 0.021) * 5 + Math.sin(y * 0.31) * 2;
      const value = Math.round(128 + grain * 38 + streak);
      const i = (y * W + x) * 4;
      image.data[i] = value;
      image.data[i + 1] = value;
      image.data[i + 2] = value;
      image.data[i + 3] = 255;
    }
  }
  ctx.putImageData(image, 0, 0);
  return finalize(canvas, false, true);
}

/* -------------------------------------------------------------------------- */
/* Tail fin: navy with an abstract gold bird                                  */
/* -------------------------------------------------------------------------- */

function drawBirdMark(ctx: CanvasRenderingContext2D): void {
  const cx = 256;
  const cy = 348;
  const scale = 1.32;
  const grad = ctx.createLinearGradient(cx, cy - 170 * scale, cx, cy + 180 * scale);
  grad.addColorStop(0, "#F8E4B1");
  grad.addColorStop(0.42, GOLD_LIGHT);
  grad.addColorStop(0.72, GOLD);
  grad.addColorStop(1, "#A87D2D");

  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(scale, scale);
  ctx.fillStyle = grad;

  /* Port wing */
  ctx.beginPath();
  ctx.moveTo(-5, 4);
  ctx.bezierCurveTo(-44, -14, -104, -50, -166, -104);
  ctx.bezierCurveTo(-124, -44, -96, 0, -62, 28);
  ctx.bezierCurveTo(-42, 44, -22, 44, -5, 32);
  ctx.closePath();
  ctx.fill();

  /* Starboard wing */
  ctx.beginPath();
  ctx.moveTo(5, 4);
  ctx.bezierCurveTo(44, -14, 104, -50, 166, -104);
  ctx.bezierCurveTo(124, -44, 96, 0, 62, 28);
  ctx.bezierCurveTo(42, 44, 22, 44, 5, 32);
  ctx.closePath();
  ctx.fill();

  /* Body */
  ctx.beginPath();
  ctx.moveTo(0, -58);
  ctx.bezierCurveTo(15, -20, 15, 36, 0, 86);
  ctx.bezierCurveTo(-15, 36, -15, -20, 0, -58);
  ctx.closePath();
  ctx.fill();

  /* Tail feathers */
  ctx.beginPath();
  ctx.moveTo(-6, 62);
  ctx.quadraticCurveTo(-30, 86, -48, 118);
  ctx.quadraticCurveTo(-18, 106, -3, 86);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(6, 62);
  ctx.quadraticCurveTo(30, 86, 48, 118);
  ctx.quadraticCurveTo(18, 106, 3, 86);
  ctx.closePath();
  ctx.fill();

  /* A couple of fine feather cuts for depth */
  ctx.strokeStyle = "rgba(60,40,10,0.30)";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(-42, -2);
  ctx.quadraticCurveTo(-88, -36, -134, -78);
  ctx.moveTo(42, -2);
  ctx.quadraticCurveTo(88, -36, 134, -78);
  ctx.stroke();

  ctx.restore();
}

function createFinMap(): THREE.CanvasTexture | null {
  const surface = make2D(512, 768);
  if (!surface) return null;
  const { canvas, ctx } = surface;
  const W = canvas.width;
  const H = canvas.height;

  const bg = ctx.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, "#0E2B4B");
  bg.addColorStop(0.35, NAVY);
  bg.addColorStop(1, "#071324");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  /* Soft studio sheen across the fin */
  const sheen = ctx.createLinearGradient(0, 0, W, H);
  sheen.addColorStop(0, "rgba(92,138,186,0.16)");
  sheen.addColorStop(0.45, "rgba(92,138,186,0.02)");
  sheen.addColorStop(1, "rgba(0,0,0,0.16)");
  ctx.fillStyle = sheen;
  ctx.fillRect(0, 0, W, H);

  drawBirdMark(ctx);

  /* Gold pinstripe along the fin root edge */
  ctx.fillStyle = "rgba(201,162,77,0.85)";
  ctx.fillRect(0, H - 12, W, 5);

  return finalize(canvas, true, false);
}

/* -------------------------------------------------------------------------- */
/* Public, cached accessors                                                   */
/* -------------------------------------------------------------------------- */

export function getFuselageMap(): THREE.Texture | null {
  const key = "fuselage-map";
  const cached = cache.get(key);
  if (cached) return cached;
  const texture = createFuselageMap();
  if (texture) cache.set(key, texture);
  return texture;
}

export function getFuselageRoughness(): THREE.Texture | null {
  const key = "fuselage-roughness";
  const cached = cache.get(key);
  if (cached) return cached;
  const texture = createRoughnessMap();
  if (texture) cache.set(key, texture);
  return texture;
}

export function getFinMap(): THREE.Texture | null {
  const key = "fin-map";
  const cached = cache.get(key);
  if (cached) return cached;
  const texture = createFinMap();
  if (texture) cache.set(key, texture);
  return texture;
}
