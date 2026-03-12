"use client";

import { Clue } from "@/types/game";

const CLUE_ICONS: Record<string, string> = {
  classification: "\u{1F50D}",
  prevalence: "\u{1F4CA}",
  geography: "\u{1F30D}",
  hotspot: "\u{1F4CD}",
  pattern: "\u{1F3AF}",
};

interface CluePanelProps {
  clues: Clue[];
  revealedCount: number;
  onRevealClue: () => void;
  canReveal: boolean;
}

export default function CluePanel({
  clues,
  revealedCount,
  onRevealClue,
  canReveal,
}: CluePanelProps) {
  const revealed = clues.slice(0, revealedCount);

  return (
    <div className="bg-black/70 backdrop-blur-md rounded-xl border border-white/10 p-4 w-80">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-bold text-white uppercase tracking-wider">
          Clues
        </h2>
        <div className="flex gap-1">
          {Array.from({ length: clues.length }).map((_, i) => (
            <div
              key={i}
              className={`w-2 h-2 rounded-full transition-colors ${
                i < revealedCount ? "bg-blue-400" : "bg-white/20"
              }`}
            />
          ))}
        </div>
      </div>

      <div className="space-y-2 mb-3">
        {revealed.map((clue, i) => (
          <div
            key={i}
            className="flex gap-2 text-sm animate-fade-in"
          >
            <span className="shrink-0 mt-0.5">
              {CLUE_ICONS[clue.type] || "#"}
            </span>
            <span className="text-white/90">{clue.text}</span>
          </div>
        ))}
      </div>

      {canReveal && (
        <button
          onClick={onRevealClue}
          className="w-full py-2 text-xs font-medium text-blue-300 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 transition"
        >
          Reveal next clue ({revealedCount}/{clues.length})
        </button>
      )}
    </div>
  );
}
