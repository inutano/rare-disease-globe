"use client";

import { RoundResult } from "@/types/game";

interface RoundModalProps {
  result: RoundResult | null;
  isGameOver: boolean;
  allResults: RoundResult[];
  totalScore: number;
  onNext: () => void;
  onPlayAgain: () => void;
}

export default function RoundModal({
  result,
  isGameOver,
  allResults,
  totalScore,
  onNext,
  onPlayAgain,
}: RoundModalProps) {
  if (isGameOver) {
    const correctCount = allResults.filter((r) => r.correct).length;

    return (
      <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/60 backdrop-blur-sm">
        <div className="bg-[#111827]/95 backdrop-blur-md rounded-2xl border border-white/10 p-8 max-w-md w-full mx-4 shadow-2xl">
          <h2 className="text-2xl font-bold text-white text-center mb-2">
            Game Over
          </h2>
          <div className="text-center mb-6">
            <div className="text-5xl font-bold text-yellow-300 mb-1">
              {totalScore}
            </div>
            <div className="text-sm text-white/50">
              {correctCount} of {allResults.length} correct
            </div>
          </div>

          <div className="space-y-2 mb-6 max-h-48 overflow-y-auto">
            {allResults.map((r, i) => (
              <div
                key={i}
                className="flex items-center justify-between text-sm px-3 py-2 rounded-lg bg-white/5"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span>{r.correct ? "\u2705" : "\u274C"}</span>
                  <span className="text-white/80 truncate">
                    {r.disease.name}
                  </span>
                </div>
                <span className="text-yellow-300/80 shrink-0 ml-2">
                  +{r.pointsEarned}
                </span>
              </div>
            ))}
          </div>

          <button
            onClick={onPlayAgain}
            className="w-full py-3 bg-blue-500 hover:bg-blue-400 text-white font-medium rounded-xl transition"
          >
            Play Again
          </button>
        </div>
      </div>
    );
  }

  if (!result) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/60 backdrop-blur-sm">
      <div className="bg-[#111827]/95 backdrop-blur-md rounded-2xl border border-white/10 p-8 max-w-md w-full mx-4 shadow-2xl">
        {result.correct ? (
          <>
            <h2 className="text-2xl font-bold text-green-400 text-center mb-2">
              Correct!
            </h2>
            <p className="text-center text-white/70 text-sm mb-4">
              You identified it in {result.cluesUsed}{" "}
              {result.cluesUsed === 1 ? "clue" : "clues"}
            </p>
          </>
        ) : (
          <>
            <h2 className="text-2xl font-bold text-red-400 text-center mb-2">
              Not this time
            </h2>
            <p className="text-center text-white/70 text-sm mb-4">
              The answer was:
            </p>
          </>
        )}

        <div className="text-center mb-6">
          <div className="text-xl font-bold text-white mb-1">
            {result.disease.name}
          </div>
          <div className="text-xs text-white/40">
            ORPHA:{result.disease.orphaCode}
          </div>
          {result.correct && (
            <div className="text-2xl font-bold text-yellow-300 mt-3">
              +{result.pointsEarned}
            </div>
          )}
        </div>

        <button
          onClick={onNext}
          className="w-full py-3 bg-blue-500 hover:bg-blue-400 text-white font-medium rounded-xl transition"
        >
          Next Round
        </button>
      </div>
    </div>
  );
}
