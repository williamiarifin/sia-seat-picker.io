"use client";

import { Component, type ReactElement, type ReactNode } from "react";
import {
  Bloom,
  EffectComposer,
  N8AO,
  SMAA,
  Vignette,
} from "@react-three/postprocessing";

interface EffectsBoundaryProps {
  children: ReactNode;
}

interface EffectsBoundaryState {
  failed: boolean;
}

/**
 * A single failed post-processing pass must not take the whole scene down.
 * If the composer throws during render we simply stop rendering effects and
 * let the forward-rendered canvas carry on.
 */
class EffectsBoundary extends Component<
  EffectsBoundaryProps,
  EffectsBoundaryState
> {
  state: EffectsBoundaryState = { failed: false };

  static getDerivedStateFromError(): EffectsBoundaryState {
    return { failed: true };
  }

  render(): ReactNode {
    return this.state.failed ? null : this.props.children;
  }
}

/**
 * Post-processing stack: cheap AO, a restrained bloom for the gold accents and
 * window highlights, a soft vignette, and SMAA (the canvas runs with MSAA off).
 * No depth of field — the camera is the star, not the bokeh.
 */
export function Effects(): ReactElement {
  return (
    <EffectsBoundary>
      <EffectComposer multisampling={0}>
        <N8AO
          halfRes
          quality="performance"
          aoRadius={2.4}
          distanceFalloff={1.2}
          intensity={1.35}
        />
        <Bloom
          luminanceThreshold={0.75}
          luminanceSmoothing={0.2}
          intensity={0.5}
          mipmapBlur
        />
        <Vignette darkness={0.55} offset={0.3} />
        <SMAA />
      </EffectComposer>
    </EffectsBoundary>
  );
}
