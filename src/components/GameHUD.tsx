"use client";

interface GameHUDProps {
  round: number;
  totalRounds: number;
  score: number;
}

export default function GameHUD({ round, totalRounds, score }: GameHUDProps) {
  return (
    <div className="flex items-center gap-4">
      <div className="bg-black/70 backdrop-blur-md rounded-xl border border-white/10 px-4 py-2">
        <span className="text-xs text-white/50 uppercase tracking-wider">
          Round
        </span>
        <div className="text-lg font-bold text-white">
          {round}
          <span className="text-white/40 text-sm font-normal">
            {" "}/ {totalRounds}
          </span>
        </div>
      </div>
      <div className="bg-black/70 backdrop-blur-md rounded-xl border border-white/10 px-4 py-2">
        <span className="text-xs text-white/50 uppercase tracking-wider">
          Score
        </span>
        <div className="text-lg font-bold text-yellow-300">{score}</div>
      </div>
    </div>
  );
}
