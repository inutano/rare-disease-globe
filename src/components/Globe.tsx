"use client";

import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import dynamic from "next/dynamic";

// react-globe.gl must be loaded client-side only (WebGL)
const GlobeGL = dynamic(() => import("react-globe.gl"), { ssr: false });

interface GlobePoint {
  lat: number;
  lng: number;
  region: string;
  disease: string;
  orphaCode: string;
  prevalenceClass: string;
  score: number;
}

interface DiseaseListItem {
  orphaCode: string;
  name: string;
  regionCount: number;
  totalRegions: number;
}

const SCORE_COLORS: Record<number, string> = {
  2: "#3b82f6", // blue — <1/1M
  3: "#22d3ee", // cyan — 1-9/1M
  4: "#facc15", // yellow — 1-9/100K
  5: "#f97316", // orange — 1-9/10K
  5.5: "#ef4444", // red — 6-9/10K
  6: "#dc2626", // dark red — >1/1K
};

function getColor(score: number): string {
  return SCORE_COLORS[score] || "#6b7280";
}

export default function Globe() {
  const globeRef = useRef<any>(null);
  const [allPoints, setAllPoints] = useState<GlobePoint[]>([]);
  const [diseaseList, setDiseaseList] = useState<DiseaseListItem[]>([]);
  const [selectedDisease, setSelectedDisease] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [hoveredPoint, setHoveredPoint] = useState<GlobePoint | null>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });

  // Load data
  useEffect(() => {
    const base = process.env.NEXT_PUBLIC_BASE_PATH || "";
    Promise.all([
      fetch(`${base}/data/globe-points.json`).then((r) => r.json()),
      fetch(`${base}/data/disease-list.json`).then((r) => r.json()),
    ]).then(([points, diseases]) => {
      setAllPoints(points);
      setDiseaseList(diseases);
    });
  }, []);

  // Handle resize
  useEffect(() => {
    const update = () =>
      setDimensions({ width: window.innerWidth, height: window.innerHeight });
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  // Auto-rotate
  useEffect(() => {
    if (globeRef.current) {
      const controls = globeRef.current.controls();
      controls.autoRotate = true;
      controls.autoRotateSpeed = 0.4;
    }
  }, [allPoints]);

  // Filter points
  const displayPoints = useMemo(() => {
    if (!selectedDisease) return allPoints;
    return allPoints.filter((p) => p.orphaCode === selectedDisease);
  }, [allPoints, selectedDisease]);

  // Filter disease list for search
  const filteredDiseases = useMemo(() => {
    if (!searchQuery) return diseaseList.slice(0, 50);
    const q = searchQuery.toLowerCase();
    return diseaseList
      .filter(
        (d) =>
          d.name.toLowerCase().includes(q) || d.orphaCode.includes(q)
      )
      .slice(0, 50);
  }, [diseaseList, searchQuery]);

  const handleDiseaseSelect = useCallback(
    (orphaCode: string) => {
      setSelectedDisease(orphaCode);
      // Zoom to first point of that disease
      if (orphaCode) {
        const pt = allPoints.find((p) => p.orphaCode === orphaCode);
        if (pt && globeRef.current) {
          globeRef.current.pointOfView(
            { lat: pt.lat, lng: pt.lng, altitude: 1.5 },
            1000
          );
          const controls = globeRef.current.controls();
          controls.autoRotate = false;
        }
      } else {
        if (globeRef.current) {
          globeRef.current.pointOfView({ altitude: 2.5 }, 1000);
          const controls = globeRef.current.controls();
          controls.autoRotate = true;
          controls.autoRotateSpeed = 0.4;
        }
      }
    },
    [allPoints]
  );

  return (
    <div className="relative w-full h-screen bg-[#0a0a1a] overflow-hidden">
      {/* Globe */}
      <GlobeGL
        ref={globeRef}
        width={dimensions.width}
        height={dimensions.height}
        globeImageUrl="//unpkg.com/three-globe/example/img/earth-blue-marble.jpg"
        bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
        backgroundImageUrl="//unpkg.com/three-globe/example/img/night-sky.png"
        pointsData={displayPoints}
        pointLat="lat"
        pointLng="lng"
        pointAltitude={(d: any) => d.score * 0.04}
        pointRadius={(d: any) => 0.25 + d.score * 0.08}
        pointColor={(d: any) => getColor(d.score)}
        pointLabel={(d: any) =>
          `<div style="background:rgba(0,0,0,0.85);color:white;padding:8px 12px;border-radius:8px;font-size:13px;max-width:280px;line-height:1.4">
            <div style="font-weight:bold;font-size:14px;margin-bottom:4px">${d.disease}</div>
            <div>${d.region}</div>
            <div style="color:${getColor(d.score)}">Prevalence: ${d.prevalenceClass}</div>
            <div style="color:#888;font-size:11px">ORPHA:${d.orphaCode}</div>
          </div>`
        }
        onPointHover={(pt: any) => setHoveredPoint(pt)}
        atmosphereColor="#4f9cff"
        atmosphereAltitude={0.2}
      />

      {/* Title */}
      <div className="absolute top-4 left-4 right-4 sm:right-auto pointer-events-none">
        <h1 className="text-xl sm:text-2xl font-bold text-white drop-shadow-lg">
          Rare Disease Globe
        </h1>
        <p className="text-xs sm:text-sm text-blue-200/70 mt-1">
          {allPoints.length.toLocaleString()} prevalence data points across{" "}
          {diseaseList.length.toLocaleString()} diseases
        </p>
        <p className="text-xs text-blue-200/40 mt-0.5">
          Source: Orphadata (Orphanet) &bull; CC-BY-4.0
        </p>
        <a
          href={`${process.env.NEXT_PUBLIC_BASE_PATH || ""}/game`}
          className="pointer-events-auto inline-block mt-2 px-3 py-1.5 text-xs font-medium text-blue-300 hover:text-white bg-white/10 hover:bg-white/20 rounded-lg border border-white/10 transition"
        >
          Play Detective
        </a>
      </div>

      {/* Search / Filter Panel */}
      <div className="absolute top-4 right-4 w-72 pointer-events-auto">
        <div className="bg-black/70 backdrop-blur-md rounded-xl border border-white/10 p-3">
          <input
            type="text"
            placeholder="Search disease or ORPHA code..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-3 py-2 bg-white/10 border border-white/10 rounded-lg text-white text-sm placeholder:text-white/40 focus:outline-none focus:border-blue-400/50"
          />
          {selectedDisease && (
            <button
              onClick={() => {
                setSelectedDisease("");
                setSearchQuery("");
                handleDiseaseSelect("");
              }}
              className="mt-2 w-full text-xs text-blue-300 hover:text-white transition"
            >
              Clear filter — show all diseases
            </button>
          )}
          <div className="mt-2 max-h-64 overflow-y-auto space-y-0.5 scrollbar-thin">
            {filteredDiseases.map((d) => (
              <button
                key={d.orphaCode}
                onClick={() => handleDiseaseSelect(d.orphaCode)}
                className={`w-full text-left px-2 py-1.5 rounded-md text-xs transition ${
                  selectedDisease === d.orphaCode
                    ? "bg-blue-500/30 text-white"
                    : "text-white/70 hover:bg-white/10 hover:text-white"
                }`}
              >
                <span className="font-medium">{d.name}</span>
                <span className="text-white/40 ml-1">
                  ({d.regionCount} countries)
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 pointer-events-none">
        <div className="bg-black/60 backdrop-blur-sm rounded-lg px-3 py-2 border border-white/10">
          <p className="text-[10px] text-white/50 mb-1 uppercase tracking-wider">
            Prevalence
          </p>
          <div className="flex gap-2 text-[10px]">
            {[
              { label: "<1/1M", color: "#3b82f6" },
              { label: "1-9/1M", color: "#22d3ee" },
              { label: "1-9/100K", color: "#facc15" },
              { label: "1-9/10K", color: "#f97316" },
              { label: ">1/1K", color: "#dc2626" },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-1">
                <span
                  className="w-2 h-2 rounded-full inline-block"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-white/60">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Stats bar */}
      {selectedDisease && (
        <div className="absolute bottom-4 right-4 pointer-events-none">
          <div className="bg-black/60 backdrop-blur-sm rounded-lg px-3 py-2 border border-white/10 text-xs text-white/70">
            Showing{" "}
            <span className="text-white font-medium">
              {displayPoints.length}
            </span>{" "}
            data points for{" "}
            <span className="text-white font-medium">
              {diseaseList.find((d) => d.orphaCode === selectedDisease)?.name}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
