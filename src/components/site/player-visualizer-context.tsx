"use client";

import { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";

type StopFn = () => void;

type Ctx = {
  /** Which source is currently the active one (e.g. "spotify-<id>" or
   *  "soundcloud"), or null if nothing has ever played. Each source's own
   *  visualizer overlay shows itself only when `activeId === its own id`. */
  activeId: string | null;
  /** Is the active source playing right now? */
  playing: boolean;
  /** Called by a player source whenever its own play/pause state changes.
   *  `stop` pauses that specific source — used to enforce "only one thing
   *  plays at a time" when a second source starts. */
  reportPlaying: (id: string, isPlaying: boolean, stop: StopFn) => void;
};

const PlayerVisualizerContext = createContext<Ctx | null>(null);

export function PlayerVisualizerProvider({ children }: { children: React.ReactNode }) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [playing, setPlaying] = useState(false);
  const activeStopRef = useRef<StopFn | null>(null);

  const reportPlaying = useCallback((id: string, isPlaying: boolean, stop: StopFn) => {
    if (isPlaying) {
      if (activeStopRef.current && activeStopRef.current !== stop) {
        activeStopRef.current();
      }
      activeStopRef.current = stop;
      setActiveId(id);
      setPlaying(true);
    } else if (activeStopRef.current === stop) {
      activeStopRef.current = null;
      setPlaying(false);
    }
  }, []);

  const value = useMemo(
    () => ({ activeId, playing, reportPlaying }),
    [activeId, playing, reportPlaying]
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
