"use client";

import { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";

type StopFn = () => void;

type Ctx = {
  /** Is a track playing right now? Drives the visualizer's visibility —
   *  it closes fully back to its initial (hidden) state as soon as this
   *  goes false, rather than lingering on screen. */
  playing: boolean;
  /** Called by a player source whenever its own play/pause state changes.
   *  `stop` pauses that specific source — used to enforce "only one thing
   *  plays at a time" when a second source starts. */
  reportPlaying: (isPlaying: boolean, stop: StopFn) => void;
};

const PlayerVisualizerContext = createContext<Ctx | null>(null);

export function PlayerVisualizerProvider({ children }: { children: React.ReactNode }) {
  const [playing, setPlaying] = useState(false);
  const activeStopRef = useRef<StopFn | null>(null);

  const reportPlaying = useCallback((isPlaying: boolean, stop: StopFn) => {
    if (isPlaying) {
      if (activeStopRef.current && activeStopRef.current !== stop) {
        activeStopRef.current();
      }
      activeStopRef.current = stop;
      setPlaying(true);
    } else if (activeStopRef.current === stop) {
      activeStopRef.current = null;
      setPlaying(false);
    }
  }, []);

  const value = useMemo(
    () => ({ playing, reportPlaying }),
    [playing, reportPlaying]
  );

  return (
    <PlayerVisualizerContext.Provider value={value}>
      {children}
    </PlayerVisualizerContext.Provider>
  );
}

export function usePlayerVisualizer() {
  const ctx = useContext(PlayerVisualizerContext);
  if (!ctx) {
    throw new Error("usePlayerVisualizer must be used within PlayerVisualizerProvider");
  }
  return ctx;
}
