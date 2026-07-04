"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import { OrbitControls, Html, Stars } from "@react-three/drei";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import * as THREE from "three";
import { mesh } from "topojson-client";
import type { GeometryObject, Topology } from "topojson-specification";

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

// Country/coastline outlines, projected onto the sphere so the gig markers
// land on recognizable geography instead of a generic lat/long wireframe.
function useCountryBorderGeometry(radius: number) {
  const [topology, setTopology] = useState<Topology | null>(null);

  useEffect(() => {
    let alive = true;
    fetch("/geo/countries-110m.json")
      .then((r) => r.json())
      .then((data: Topology) => alive && setTopology(data))
      .catch(() => {
        /* borders are decorative — silently keep the plain wireframe */
      });
    return () => {
      alive = false;
    };
  }, []);

  return useMemo(() => {
    if (!topology) return null;

    const lines = mesh(topology, topology.objects.countries as GeometryObject);
    const positions: number[] = [];

    for (const line of lines.coordinates) {
      for (let i = 0; i < line.length - 1; i++) {
        const a = latLonToVec3(line[i][1], line[i][0], radius);
        const b = latLonToVec3(line[i + 1][1], line[i + 1][0], radius);
        positions.push(a.x, a.y, a.z, b.x, b.y, b.z);
      }
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(positions, 3)
    );
    return geometry;
  }, [topology, radius]);
}

// Bakes a logo PNG into an equirectangular (2:1) canvas texture, confined to
// a band around the equator. Nothing is ever drawn near the top/bottom rows
// (the poles), so the projection's inherent pole-stretching never touches it.
function useEquirectLogoTexture(
  src: string,
  opts: { widthFrac: number; feather?: boolean }
) {
  const [texture, setTexture] = useState<THREE.CanvasTexture | null>(null);
  const { widthFrac, feather } = opts;

  useEffect(() => {
    let alive = true;
    const img = new Image();
    img.onload = () => {
      if (!alive) return;
      const W = 2048;
      const H = 1024;
      const canvas = document.createElement("canvas");
      canvas.width = W;
      canvas.height = H;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const drawW = W * widthFrac;
      const drawH = drawW * (img.height / img.width);
      const x = (W - drawW) / 2;
      const y = (H - drawH) / 2;

      if (feather) {
        const patch = document.createElement("canvas");
        patch.width = drawW;
        patch.height = drawH;
        const pctx = patch.getContext("2d");
        if (pctx) {
          pctx.drawImage(img, 0, 0, drawW, drawH);
          pctx.globalCompositeOperation = "destination-in";
          const grad = pctx.createRadialGradient(
            drawW / 2, drawH / 2, 0,
            drawW / 2, drawH / 2, Math.max(drawW, drawH) * 0.6
          );
          grad.addColorStop(0, "rgba(0,0,0,1)");
          grad.addColorStop(0.7, "rgba(0,0,0,1)");
          grad.addColorStop(1, "rgba(0,0,0,0)");
          pctx.fillStyle = grad;
          pctx.fillRect(0, 0, drawW, drawH);
          ctx.drawImage(patch, x, y);
        }
      } else {
        ctx.drawImage(img, x, y, drawW, drawH);
      }

      const tex = new THREE.CanvasTexture(canvas);
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.needsUpdate = true;
      setTexture(tex);
    };
    img.src = src;
    return () => {
      alive = false;
    };
  }, [src, widthFrac, feather]);

  return texture;
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
  controlsRef,
}: {
  selected: string | null;
  onSelect: (id: string | null) => void;
  controlsRef: React.RefObject<OrbitControlsImpl | null>;
}) {
  const { camera } = useThree();
  const markers = useMemo(
    () => GIGS.map((g) => ({ ...g, pos: latLonToVec3(g.lat, g.lon, RADIUS * 1.01) })),
    []
  );
  const borderGeometry = useCountryBorderGeometry(RADIUS * 1.003);
  const wordmarkTexture = useEquirectLogoTexture("/textures/wordmark.png", {
    widthFrac: 0.17,
  });
  const tribalTexture = useEquirectLogoTexture("/textures/tribal-glow.png", {
    widthFrac: 0.48,
    feather: true,
  });

  // When a marker is selected, glide the camera around to face it instead of
  // just freezing auto-rotate wherever it happened to be — otherwise the
  // selected city can end up on the far side of the globe, off-screen.
  const flyTarget = useRef<THREE.Vector3 | null>(null);
  useEffect(() => {
    const marker = selected && markers.find((m) => m.id === selected);
    flyTarget.current = marker
      ? marker.pos.clone().normalize().multiplyScalar(camera.position.length())
      : null;
  }, [selected, markers, camera]);

  useFrame(() => {
    if (!flyTarget.current) return;
    camera.position.lerp(flyTarget.current, 0.08);
    controlsRef.current?.update();
  });

  return (
    <group>
      {/* solid core */}
      <mesh>
        <sphereGeometry args={[RADIUS, 48, 48]} />
        <meshStandardMaterial color="#0d1017" roughness={0.85} metalness={0.2} />
      </mesh>

      {/* blueprint construction grid — faint, purely technical backdrop */}
      <mesh>
        <sphereGeometry args={[RADIUS * 1.001, 24, 18]} />
        <meshBasicMaterial color="#e7e3d8" wireframe transparent opacity={0.04} />
      </mesh>

      {/* real country/coastline outlines — gives the markers geographic context */}
      {borderGeometry && (
        <lineSegments geometry={borderGeometry}>
          <lineBasicMaterial color="#e7e3d8" transparent opacity={0.4} />
        </lineSegments>
      )}

      {/* Maschinenkindt wordmark, wrapped as a real spherical band around the
          equator — printed on the surface, not a flat decal */}
      {wordmarkTexture && (
        <mesh rotation={[0, 0, 0]}>
          <sphereGeometry args={[RADIUS * 1.01, 48, 48]} />
          <meshBasicMaterial
            map={wordmarkTexture}
            transparent
            opacity={0.9}
            depthWrite={false}
          />
        </mesh>
      )}

      {/* tribal mark, additive-blended and feathered so it reads as an
          ambient glow/pattern woven into the surface, not a sticker */}
      {tribalTexture && (
        <mesh rotation={[0, Math.PI * 0.85, 0]}>
          <sphereGeometry args={[RADIUS * 1.014, 48, 48]} />
          <meshBasicMaterial
            map={tribalTexture}
            transparent
            opacity={0.14}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>
      )}

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
              <Html distanceFactor={4} center style={{ pointerEvents: "none" }}>
                <div className="pointer-events-auto w-56 max-w-[80vw] -translate-y-20 border border-ember/40 bg-[#0d1017]/95 p-4 backdrop-blur-sm">
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
  const controlsRef = useRef<OrbitControlsImpl | null>(null);

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
              <GlobeScene
                selected={selected}
                onSelect={setSelected}
                controlsRef={controlsRef}
              />
              <OrbitControls
                ref={controlsRef}
                enablePan={false}
                enableZoom={false}
                autoRotate={!selected}
                autoRotateSpeed={0.6}
                minPolarAngle={Math.PI / 6}
                maxPolarAngle={(Math.PI * 5) / 6}
              />
            </Canvas>
          </div>
        </div>
      </div>
    </section>
  );
}
