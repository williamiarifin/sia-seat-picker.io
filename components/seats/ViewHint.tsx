"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";

import type { ScenePhase } from "@/lib/types";

import { MoveIcon, TapIcon } from "./icons";

export function ViewHint({
  mode,
  className = "",
}: {
  mode: ScenePhase;
  className?: string;
}) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (mode === "confirming" || mode === "flying") return;
    const timer = window.setTimeout(() => setVisible(false), 4500);
    return () => window.clearTimeout(timer);
  }, [mode]);

  if (mode === "confirming" || mode === "flying") return null;

  const inSeat = mode === "in-seat";

  return (
    <AnimatePresence>
      {visible ? (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 6 }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          className={`glass-soft pointer-events-none items-center gap-2 rounded-full px-3 py-1.5 text-[10px] tracking-wide text-mist/80 ${className}`}
        >
          {inSeat ? (
            <MoveIcon className="h-3.5 w-3.5 text-mist/60" />
          ) : (
            <TapIcon className="h-3.5 w-3.5 text-mist/60" />
          )}
          {inSeat ? "Drag to look around" : "Tap a seat to zoom in"}
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
