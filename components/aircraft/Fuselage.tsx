"use client";

import { useMemo, useRef } from "react";
import type { JSX } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";

import { sceneState } from "@/components/scene/sceneState";
import {
  BARREL_FRONT_Z,
  BARREL_REAR_Z,
  NOSE_Z,
  buildShellGeometry,
  sampleFuselageSpine,
  TAIL_Z,
} from "./geometry";
import { PAINT } from "./materials";
import { getFuselageMap, getFuselageRoughness } from "./textures";

const DEG = Math.PI / 180;

/**
 * Exterior fuselage shell. Split into nose, roof, two upper walls, belly and
 * tail so the roof can be cut away for the top-down seat map. All halves share
 * analytic spine normals, so the sector seams do not show.
 */
export function Fuselage(): JSX.Element {
  const map = useMemo(() => getFuselageMap(), []);
  const roughnessMap = useMemo(() => getFuselageRoughness(), []);

  const nose = useMemo(
    () =>
      buildShellGeometry(
        sampleFuselageSpine(NOSE_Z, BARREL_FRONT_Z, 26),
        -Math.PI,
        Math.PI,
        56,
        { capStart: true },
      ),
    [],
  );

  const roof = useMemo(
    () =>
      buildShellGeometry(
        sampleFuselageSpine(BARREL_FRONT_Z, BARREL_REAR_Z, 68),
        -50 * DEG,
        50 * DEG,
        20,
      ),
    [],
  );

  const starboardWall = useMemo(
    () =>
      buildShellGeometry(
        sampleFuselageSpine(BARREL_FRONT_Z, BARREL_REAR_Z, 68),
        50 * DEG,
        100 * DEG,
        12,
      ),
    [],
  );

  const portWall = useMemo(
    () =>
      buildShellGeometry(
        sampleFuselageSpine(BARREL_FRONT_Z, BARREL_REAR_Z, 68),
        -100 * DEG,
        -50 * DEG,
        12,
      ),
    [],
  );

  const belly = useMemo(
    () =>
      buildShellGeometry(
        sampleFuselageSpine(BARREL_FRONT_Z, BARREL_REAR_Z, 68),
        100 * DEG,
        260 * DEG,
        30,
      ),
    [],
  );

  const tail = useMemo(
    () =>
      buildShellGeometry(
        sampleFuselageSpine(BARREL_REAR_Z, TAIL_Z, 22),
        -Math.PI,
        Math.PI,
        56,
        { capEnd: true },
      ),
    [],
  );

  const bodyMaterial = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        ...PAINT,
        map,
        roughnessMap,
      }),
    [map, roughnessMap],
  );

  const wallMaterial = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        ...PAINT,
        map,
        roughnessMap,
        transparent: true,
        opacity: 0.4,
        depthWrite: false,
      }),
    [map, roughnessMap],
  );

  const roofMaterial = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        ...PAINT,
        map,
        roughnessMap,
        transparent: true,
        opacity: 0,
        depthWrite: false,
      }),
    [map, roughnessMap],
  );

  const roofMesh = useRef<THREE.Mesh>(null);
  const roofOpacity = useRef(0);
  const wallOpacity = useRef(0.4);

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05);
    const reveal = THREE.MathUtils.clamp(sceneState.reveal, 0, 1);

    /* Roof: invisible for the top-down map, fades in as the camera descends. */
    const roofTarget = THREE.MathUtils.smoothstep(reveal, 0.22, 0.88);
    roofOpacity.current = THREE.MathUtils.damp(roofOpacity.current, roofTarget, 9, dt);
    const roofValue = THREE.MathUtils.clamp(roofOpacity.current, 0, 1);
    const roofTransparent = roofValue < 0.995;
    roofMaterial.opacity = roofValue;
    if (roofMaterial.transparent !== roofTransparent) {
      roofMaterial.transparent = roofTransparent;
      roofMaterial.depthWrite = !roofTransparent;
      roofMaterial.needsUpdate = true;
    }
    if (roofMesh.current) {
      roofMesh.current.visible = roofValue > 0.012;
    }

    /* Upper side skin: translucent at reveal 0 so the cabin reads from above. */
    const wallTarget = 0.4 + 0.6 * THREE.MathUtils.smoothstep(reveal, 0.04, 0.62);
    wallOpacity.current = THREE.MathUtils.damp(wallOpacity.current, wallTarget, 9, dt);
    const wallValue = THREE.MathUtils.clamp(wallOpacity.current, 0, 1);
    const wallTransparent = wallValue < 0.995;
    wallMaterial.opacity = wallValue;
    if (wallMaterial.transparent !== wallTransparent) {
      wallMaterial.transparent = wallTransparent;
      wallMaterial.depthWrite = !wallTransparent;
      wallMaterial.needsUpdate = true;
    }
  });

  return (
    <group name="fuselage">
      <mesh geometry={nose} material={bodyMaterial} name="fuselage-nose" />
      <mesh geometry={tail} material={bodyMaterial} name="fuselage-tail" />
      <mesh geometry={belly} material={bodyMaterial} name="fuselage-belly" />
      <mesh
        ref={roofMesh}
        geometry={roof}
        material={roofMaterial}
        visible={false}
        name="fuselage-roof"
      />
      <mesh
        geometry={starboardWall}
        material={wallMaterial}
        name="fuselage-wall-starboard"
      />
      <mesh geometry={portWall} material={wallMaterial} name="fuselage-wall-port" />
    </group>
  );
}
