"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { DiseaseListItem } from "@/types/game";

interface GuessInputProps {
  diseaseList: DiseaseListItem[];
  guess: string;
  onGuessChange: (guess: string) => void;
  onSubmit: () => void;
  onSkip: () => void;
  disabled: boolean;
  wrongFlash: boolean;
}

export default function GuessInput({
  diseaseList,
  guess,
  onGuessChange,
  onSubmit,
  onSkip,
  disabled,
  wrongFlash,
}: GuessInputProps) {
  const [query, setQuery] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const filtered = useMemo(() => {
    if (!query) return [];
    const q = query.toLowerCase();
    return diseaseList
      .filter(
        (d) => d.name.toLowerCase().includes(q) || d.orphaCode.includes(q)
      )
      .slice(0, 30);
  }, [diseaseList, query]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleSelect = (item: DiseaseListItem) => {
    onGuessChange(item.orphaCode);
    setQuery(item.name);
    setShowDropdown(false);
  };

  const handleSubmit = () => {
    if (!guess) return;
    onSubmit();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      // If exactly one match, select it then submit
      if (filtered.length === 1 && !guess) {
        handleSelect(filtered[0]);
        return;
      }
      handleSubmit();
    }
  };

  return (
    <div ref={containerRef} className="relative w-full max-w-md mx-auto">
      <div
        className={`flex gap-2 transition-transform ${
          wrongFlash ? "animate-shake" : ""
        }`}
      >
        <div className="relative flex-1">
          <input
            ref={inputRef}
            type="text"
            placeholder="Type disease name to guess..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setShowDropdown(true);
              onGuessChange(""); // clear selected orphaCode when typing
            }}
            onFocus={() => query && setShowDropdown(true)}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            className="w-full px-4 py-3 bg-black/80 backdrop-blur-md border border-white/20 rounded-xl text-white text-sm placeholder:text-white/40 focus:outline-none focus:border-blue-400/60 disabled:opacity-40"
          />

          {showDropdown && filtered.length > 0 && (
            <div className="absolute bottom-full mb-1 left-0 right-0 bg-black/90 backdrop-blur-md border border-white/10 rounded-xl max-h-48 overflow-y-auto z-50">
              {filtered.map((d) => (
                <button
                  key={d.orphaCode}
                  onClick={() => handleSelect(d)}
                  className="w-full text-left px-3 py-2 text-sm text-white/80 hover:bg-white/10 hover:text-white transition"
                >
                  <span className="font-medium">{d.name}</span>
                  <span className="text-white/30 ml-2 text-xs">
                    ORPHA:{d.orphaCode}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        <button
          onClick={handleSubmit}
          disabled={disabled || !guess}
          className="px-5 py-3 bg-blue-500/80 hover:bg-blue-500 text-white text-sm font-medium rounded-xl border border-blue-400/30 transition disabled:opacity-30 disabled:hover:bg-blue-500/80"
        >
          Guess
        </button>

        <button
          onClick={onSkip}
          disabled={disabled}
          className="px-4 py-3 bg-white/5 hover:bg-white/10 text-white/60 hover:text-white text-sm rounded-xl border border-white/10 transition disabled:opacity-30"
        >
          Skip
        </button>
      </div>
    </div>
  );
}
