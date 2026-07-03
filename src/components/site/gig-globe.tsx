"use client";

import { useMemo, useState } from "react";
import { Canvas, type ThreeEvent } from "@react-three/fiber";
import { OrbitControls, Html, Stars } from "@react-three/drei";
import * as THREE from "three";

type Gig = {
  id: string;
  city: string;
  country: string;
  venue: string;
  date: string; // ISO yyyy-mm-dd
  lat: number;
  lon: number;
};

const GIGS: Gig[] = [
  { id: "ber", city: "Berlin", country: "DE", venue: "Bunker Halle 3", date: "2026-08-14", lat: 52.52, lon: 13.405 },
  { id: "bxl", city: "Brüssel", country: "BE", venue: "Fuse", date: "2026-08-29", lat: 50.8503, lon: 4.3517 },
  { id: "ams", city: "Amsterdam", country: "NL", venue: "Radion", date: "2026-09-05", lat: 52.3676, lon: 4.9041 },
  { id: "waw", city: "Warschau", country: "PL", venue: "Prozak 2.0", date: "2026-09-19", lat: 52.2297, lon: 21.0122 },
  { id: "prg", city: "Prag", country: "CZ", venue: "Cross Club", date: "2026-10-03", lat: 50.0755, lon: 14.4378 },
  { id: "vie", city: "Wien", country: "AT", venue: "Grelle Forelle", date: "2026-10-17", lat: 48.2082, lon: 16.3738 },
];

const RADIUS = 2;

function latLonToVec3(lat: number, lon: number, radius: number) {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);
  return new THREE.Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta)
  );
}

function formatDate(iso: string) {
  return new Date(`${iso}T00:00:00`).toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function GlobeScene({
  selected,
  onSelect,
}: {
  selected: string | null;
  onSelect: (id: string | null) => void;
}) {
  const markers = useMemo(
    () => GIGS.map((g) => ({ ...g, pos: latLonToVec3(g.lat, g.lon, RADIUS * 1.01) })),
    []
  );

  return (
    <group>
      {/* solid core */}
      <mesh>
        <sphereGeometry args={[RADIUS, 48, 48]} />
        <meshStandardMaterial color="#0d1017" roughness={0.85} metalness={0.2} />
      </mesh>

      {/* blueprint wireframe skin */}
      <mesh>
        <sphereGeometry args={[RADIUS * 1.002, 24, 18]} />
        <meshBasicMaterial color="#e7e3d8" wireframe transparent opacity={0.08} />
      </mesh>

      {/* rim glow shell */}
      <mesh>
        <sphereGeometry args={[RADIUS * 1.06, 48, 48]} />
        <meshBasicMaterial color="#ff3c17" transparent opacity={0.05} side={THREE.BackSide} />
      </mesh>

      {markers.map((g) => {
        const isSelected = selected === g.id;
        return (
          <group key={g.id} position={g.pos}>
            <mesh
              onClick={(e: ThreeEvent<MouseEvent>) => {
                e.stopPropagation();
                onSelect(isSelected ? null : g.id);
              }}
              onPointerOver={(e: ThreeEvent<PointerEvent>) => {
                e.stopPropagation();
                document.body.style.cursor = "pointer";
              }}
              onPointerOut={() => {
                document.body.style.cursor = "auto";
              }}
            >
              <sphereGeometry args={[isSelected ? 0.065 : 0.045, 16, 16]} />
              <meshBasicMaterial color={isSelected ? "#ffffff" : "#ff3c17"} />
            </mesh>

            {/* soft glow halo */}
            <mesh scale={isSelected ? 2.6 : 1.8}>
              <sphereGeometry args={[0.045, 16, 16]} />
              <meshBasicMaterial color="#ff3c17" transparent opacity={0.25} depthWrite={false} />
            </mesh>

            {isSelected && (
              <Html distanceFactor={7} center style={{ pointerEvents: "none" }}>
                <div className="pointer-events-auto w-56 -translate-y-20 border border-ember/40 bg-[#0d1017]/95 p-4 backdrop-blur-sm">
                  <p className="u-label text-[0.55rem] text-ember">{g.country}</p>
                  <p className="font-display font-semibold text-xl leading-none text-bone">
                    {g.city}
                  </p>
                  <p className="mt-2 font-tech text-sm text-bone/75">{g.venue}</p>
                  <p className="mt-1 font-mono text-xs text-steel">{formatDate(g.date)}</p>
                  <button
                    type="button"
                    onClick={() => onSelect(null)}
                    className="mt-3 font-mono text-[0.6rem] uppercase tracking-[0.2em] text-steel hover:text-bone"
                  >
                    Schließen ×
                  </button>
                </div>
              </Html>
            )}
          </group>
        );
      })}
    </group>
  );
}

export function GigGlobe() {
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <section
      id="tour"
      className="relative overflow-hidden border-t border-[var(--hairline)] py-28 md:py-40"
    >
      <div className="mx-auto grid max-w-[110rem] gap-16 px-5 md:grid-cols-12 md:px-14">
        <div className="md:col-span-5">
          <p className="u-label mb-6 flex items-center gap-3">
            <span className="h-px w-10 bg-ember" />
            Route 04 — Tourdaten
          </p>
          <h2 className="font-display font-semibold mb-8 text-[clamp(2.4rem,6vw,5rem)] leading-[0.9] text-bone">
            Wo die<br />
            <span className="text-ember/90">Maschine landet.</span>
          </h2>
          <p className="mb-10 max-w-md font-tech text-base font-light leading-relaxed text-bone/75">
            Signale auf dem Globus. Ziehen zum Drehen, anklicken für Datum und
            Location.
          </p>

          <ul className="border-t border-[var(--hairline)]">
            {GIGS.map((g) => {
              const isSelected = selected === g.id;
              return (
                <li key={g.id} className="border-b border-[var(--hairline)]">
                  <button
                    type="button"
                    onClick={() => setSelected(isSelected ? null : g.id)}
                    className={`flex w-full items-baseline justify-between gap-4 py-3 text-left transition-colors ${
                      isSelected ? "text-ember" : "text-bone/80 hover:text-bone"
                    }`}
                  >
                    <span className="font-tech text-sm uppercase tracking-[0.1em]">
                      {g.city} <span className="text-steel">— {g.venue}</span>
                    </span>
                    <span className="shrink-0 font-mono text-xs text-steel">
                      {formatDate(g.date)}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="md:col-span-7 md:col-start-6">
          <div className="relative h-[26rem] w-full md:h-[32rem]">
            <Canvas camera={{ position: [0, 0, 6], fov: 45 }}>
              <ambientLight intensity={0.6} />
              <pointLight position={[4, 3, 5]} intensity={40} color="#ff5a33" />
              <pointLight position={[-4, -2, -5]} intensity={10} color="#767c88" />
              <Stars radius={40} depth={20} count={1200} factor={2} fade speed={0.4} />
              <GlobeScene selected={selected} onSelect={setSelected} />
              <OrbitControls
                enablePan={false}
                enableZoom={false}
                autoRotate={!selected}
                autoRotateSpeed={0.6}
                minPolarAngle={Math.PI / 3}
                maxPolarAngle={(Math.PI * 2) / 3}
              />
            </Canvas>
          </div>
        </div>
      </div>
    </section>
  );
}
