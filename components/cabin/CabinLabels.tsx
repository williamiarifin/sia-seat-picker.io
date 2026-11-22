"use client";

import { useEffect, useMemo } from "react";
import type { JSX } from "react";
import * as THREE from "three";

import { cabinExtent } from "@/lib/seatmap";
import { cabinColor, palette } from "@/lib/theme";
import type { CabinClass } from "@/lib/types";
import { box, mergeParts } from "./builders";

const ZONES: Array<{ cabin: CabinClass; text: string; rows: string }> = [
  { cabin: "first", text: "FIRST", rows: "ROWS 1–2" },
  { cabin: "business", text: "BUSINESS", rows: "ROWS 3–6" },
  { cabin: "economy", text: "ECONOMY", rows: "ROWS 7–29" },
];

const LABEL_Y = 3.38;

function drawTracked(
  context: CanvasRenderingContext2D,
  text: string,
  centerX: number,
  baseline: number,
  tracking: number,
): void {
  const characters = Array.from(text);
  const widths = characters.map((character) => context.measureText(character).width);
  const total =
    widths.reduce((sum, width) => sum + width, 0) +
    tracking * Math.max(0, characters.length - 1);
  let x = centerX - total / 2;
  characters.forEach((character, index) => {
    context.fillText(character, x, baseline);
    x += widths[index] + tracking;
  });
}

function createLabelTexture(
  text: string,
  rows: string,
  accent: string,
): THREE.CanvasTexture | null {
  if (typeof document === "undefined") return null;
  const width = 1024;
  const height = 256;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (!context) return null;

  context.clearRect(0, 0, width, height);
  context.textAlign = "left";
  context.textBaseline = "alphabetic";

  context.shadowColor = "rgba(3, 10, 20, 0.55)";
  context.shadowBlur = 22;
  context.fillStyle = accent;
  context.font =
    '600 98px "Optima", "Segoe UI", "Helvetica Neue", Arial, sans-serif';
  drawTracked(context, text, width / 2, 146, 20);

  context.shadowBlur = 0;
  const ruleWidth = 250;
  const ruleGradient = context.createLinearGradient(
    width / 2 - ruleWidth / 2,
    0,
    width / 2 + ruleWidth / 2,
    0,
  );
  ruleGradient.addColorStop(0, "rgba(217, 177, 92, 0)");
  ruleGradient.addColorStop(0.5, "rgba(217, 177, 92, 0.85)");
  ruleGradient.addColorStop(1, "rgba(217, 177, 92, 0)");
  context.fillStyle = ruleGradient;
  context.fillRect(width / 2 - ruleWidth / 2, 168, ruleWidth, 2);

  context.fillStyle = "rgba(233, 240, 247, 0.62)";
  context.font =
    '500 32px "Segoe UI", "Helvetica Neue", Arial, sans-serif';
  drawTracked(context, rows, width / 2, 214, 8);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  texture.needsUpdate = true;
  return texture;
}

function buildBoundaryStrips(): THREE.BufferGeometry {
  const firstRear = cabinExtent("first").rear;
  const businessFront = cabinExtent("business").front;
  const businessRear = cabinExtent("business").rear;
  const economyFront = cabinExtent("economy").front;
  const boundaries = [
    (firstRear + businessFront) / 2 + 0.22,
    (businessRear + economyFront) / 2 + 0.22,
  ];

  const parts: THREE.BufferGeometry[] = [];
  for (const z of boundaries) {
    for (let i = 0; i < 13; i += 1) {
      const x = -1.32 + i * 0.22;
      parts.push(box(0.13, 0.006, 0.05, x, 0.012, z));
    }
  }
  return mergeParts(parts);
}

export function CabinLabels({ visible }: { visible: boolean }): JSX.Element {
  const labels = useMemo(
    () =>
      ZONES.map((zone) => {
        const extent = cabinExtent(zone.cabin);
        return {
          ...zone,
          z: (extent.front + extent.rear) / 2,
          texture: createLabelTexture(
            zone.text,
            zone.rows,
            cabinColor[zone.cabin].glow,
          ),
        };
      }),
    [],
  );

  const dashes = useMemo(buildBoundaryStrips, []);

  useEffect(
    () => () => {
      for (const label of labels) label.texture?.dispose();
    },
    [labels],
  );

  useEffect(() => () => dashes.dispose(), [dashes]);

  return (
    <group visible={visible}>
      {labels.map((label) => (
        <mesh
          key={label.cabin}
          rotation-x={-Math.PI / 2}
          position={[0, LABEL_Y, label.z]}
          renderOrder={4}
        >
          <planeGeometry args={[2.9, 0.725]} />
          <meshBasicMaterial
            map={label.texture ?? undefined}
            transparent
            depthWrite={false}
            toneMapped={false}
            side={THREE.DoubleSide}
            color={label.texture ? "#ffffff" : cabinColor[label.cabin].glow}
          />
        </mesh>
      ))}

      <mesh geometry={dashes} dispose={null} renderOrder={3}>
        <meshBasicMaterial
          color={palette.goldBright}
          transparent
          opacity={0.6}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}
