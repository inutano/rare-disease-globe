"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { GlobePoint } from "@/types/game";

const GlobeGL = dynamic(() => import("react-globe.gl"), { ssr: false });

const SCORE_COLORS: Record<number, string> = {
  2: "#3b82f6",
  3: "#22d3ee",
  4: "#facc15",
  5: "#f97316",
  5.5: "#ef4444",
  6: "#dc2626",
};

function getColor(score: number): string {
  return SCORE_COLORS[score] || "#6b7280";
}

interface GameGlobeProps {
  points: GlobePoint[];
  showColors: boolean;
  zoomTarget?: { lat: number; lng: number } | null;
  roundEnded: boolean;
}

export default function GameGlobe({
  points,
  showColors,
  zoomTarget,
  roundEnded,
}: GameGlobeProps) {
  const globeRef = useRef<any>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const prevZoom = useRef<string | null>(null);

  useEffect(() => {
    const update = () =>
      setDimensions({ width: window.innerWidth, height: window.innerHeight });
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  useEffect(() => {
    if (globeRef.current) {
      const controls = globeRef.current.controls();
      controls.autoRotate = true;
      controls.autoRotateSpeed = 0.3;
    }
  }, [points]);

  // Handle zoom to target
  useEffect(() => {
    if (!zoomTarget || !globeRef.current) return;
    const key = `${zoomTarget.lat},${zoomTarget.lng}`;
    if (key === prevZoom.current) return;
    prevZoom.current = key;
    globeRef.current.pointOfView(
      { lat: zoomTarget.lat, lng: zoomTarget.lng, altitude: 1.5 },
      1200
    );
    const controls = globeRef.current.controls();
    controls.autoRotate = false;
  }, [zoomTarget]);

  return (
    <GlobeGL
      ref={globeRef}
      width={dimensions.width}
      height={dimensions.height}
      globeImageUrl="//unpkg.com/three-globe/example/img/earth-blue-marble.jpg"
      bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
      backgroundImageUrl="//unpkg.com/three-globe/example/img/night-sky.png"
      pointsData={points}
      pointLat="lat"
      pointLng="lng"
      pointAltitude={(d: any) => d.score * 0.04}
      pointRadius={(d: any) => 0.25 + d.score * 0.08}
      pointColor={(d: any) =>
        showColors ? getColor(d.score) : "#9ca3af"
      }
      pointLabel={(d: any) => {
        if (roundEnded) {
          return `<div style="background:rgba(0,0,0,0.85);color:white;padding:8px 12px;border-radius:8px;font-size:13px;max-width:280px;line-height:1.4">
            <div style="font-weight:bold;font-size:14px;margin-bottom:4px">${d.disease}</div>
            <div>${d.region}</div>
            <div style="color:${getColor(d.score)}">Prevalence: ${d.prevalenceClass}</div>
          </div>`;
        }
        return `<div style="background:rgba(0,0,0,0.85);color:white;padding:6px 10px;border-radius:8px;font-size:13px">
          <div>${d.region}</div>
        </div>`;
      }}
      atmosphereColor="#4f9cff"
      atmosphereAltitude={0.2}
      pointsTransitionDuration={800}
    />
  );
}
