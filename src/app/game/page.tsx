"use client";

import { useReducer, useEffect, useState, useMemo, useCallback } from "react";
import { DiseaseRecord, DiseaseListItem, GlobePoint, Clue } from "@/types/game";
import { generateClues } from "@/lib/clue-generator";
import { gameReducer, initialGameState } from "@/lib/game-reducer";
import GameGlobe from "@/components/GameGlobe";
import CluePanel from "@/components/CluePanel";
import GuessInput from "@/components/GuessInput";
import GameHUD from "@/components/GameHUD";
import RoundModal from "@/components/RoundModal";

export default function GamePage() {
  const [state, dispatch] = useReducer(gameReducer, initialGameState);
  const [allDiseases, setAllDiseases] = useState<DiseaseRecord[]>([]);
  const [diseaseList, setDiseaseList] = useState<DiseaseListItem[]>([]);
  const [wrongFlash, setWrongFlash] = useState(false);

  // Load data
  useEffect(() => {
    const base = process.env.NEXT_PUBLIC_BASE_PATH || "";
    Promise.all([
      fetch(`${base}/data/diseases.json`).then((r) => r.json()),
      fetch(`${base}/data/disease-list.json`).then((r) => r.json()),
    ]).then(([diseases, list]) => {
      setAllDiseases(diseases);
      setDiseaseList(list);
    });
  }, []);

  // Generate clues for the current target
  const clues: Clue[] = useMemo(() => {
    if (!state.targetDisease) return [];
    return generateClues(state.targetDisease);
  }, [state.targetDisease]);

  // Determine which clues have been revealed
  const revealedClues = clues.slice(0, state.clueIndex + 1);

  // Determine globe state based on revealed clues
  const showPoints = revealedClues.some((c) => c.revealPoints);
  const showColors = revealedClues.some((c) => c.revealColors);
  const zoomClue = [...revealedClues].reverse().find((c) => c.zoomTo);

  // Build globe points for the current disease
  const globePoints: GlobePoint[] = useMemo(() => {
    if (!state.targetDisease || !showPoints) return [];
    return state.targetDisease.prevalences
      .filter(
        (p) =>
          p.region !== "Worldwide" &&
          p.region !== "Europe" &&
          p.region !== "Africa" &&
          p.region !== "Asia" &&
          p.region !== "North America" &&
          p.region !== "South America" &&
          p.region !== "Oceania" &&
          p.region !== "Latin America" &&
          p.region !== "South East Asia" &&
          p.region !== "Eastern Mediterranean Asia" &&
          p.region !== "Western Asia" &&
          p.region !== "Specific population"
      )
      .map((p) => ({
        lat: p.lat + (Math.random() - 0.5) * 2,
        lng: p.lng + (Math.random() - 0.5) * 2,
        region: p.region,
        disease: state.targetDisease!.name,
        orphaCode: state.targetDisease!.orphaCode,
        prevalenceClass: p.class,
        score: p.score,
      }));
  }, [state.targetDisease, showPoints]);

  const handleStartGame = useCallback(() => {
    dispatch({ type: "START_GAME", diseases: allDiseases });
  }, [allDiseases]);

  const handleRevealClue = useCallback(() => {
    dispatch({ type: "REVEAL_CLUE" });
  }, []);

  const handleGuessChange = useCallback((guess: string) => {
    dispatch({ type: "SET_GUESS", guess });
  }, []);

  const handleSubmit = useCallback(() => {
    if (!state.guess || !state.targetDisease) return;
    const correct = state.guess === state.targetDisease.orphaCode;
    if (!correct) {
      setWrongFlash(true);
      setTimeout(() => setWrongFlash(false), 500);
    }
    dispatch({ type: "SUBMIT_GUESS", correct });
  }, [state.guess, state.targetDisease]);

  const handleSkip = useCallback(() => {
    dispatch({ type: "SKIP_ROUND" });
  }, []);

  const handleNext = useCallback(() => {
    dispatch({ type: "NEXT_ROUND" });
  }, []);

  const handlePlayAgain = useCallback(() => {
    dispatch({ type: "RESET_GAME" });
  }, []);

  const roundEnded = state.status === "roundResult" || state.status === "gameOver";
  const lastResult =
    state.roundHistory.length > 0
      ? state.roundHistory[state.roundHistory.length - 1]
      : null;

  // Menu screen
  if (state.status === "menu") {
    return (
      <div className="relative w-full h-screen bg-[#0a0a1a] overflow-hidden">
        <GameGlobe points={[]} showColors={false} roundEnded={false} />
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50 backdrop-blur-sm">
          <div className="bg-[#111827]/95 backdrop-blur-md rounded-2xl border border-white/10 p-8 max-w-md w-full mx-4 shadow-2xl text-center">
            <h1 className="text-3xl font-bold text-white mb-2">
              Rare Disease Detective
            </h1>
            <p className="text-white/60 text-sm mb-6 leading-relaxed">
              Identify rare diseases from progressive clues about their
              classification, prevalence, and geographic distribution. Use fewer
              clues for a higher score!
            </p>
            <div className="grid grid-cols-3 gap-3 mb-6 text-xs text-white/50">
              <div className="bg-white/5 rounded-lg p-3">
                <div className="text-2xl mb-1">{"\u{1F50D}"}</div>
                <div>5 clues per round</div>
              </div>
              <div className="bg-white/5 rounded-lg p-3">
                <div className="text-2xl mb-1">{"\u{1F3AF}"}</div>
                <div>5 rounds per game</div>
              </div>
              <div className="bg-white/5 rounded-lg p-3">
                <div className="text-2xl mb-1">{"\u2B50"}</div>
                <div>Max 2,500 points</div>
              </div>
            </div>
            <button
              onClick={handleStartGame}
              disabled={allDiseases.length === 0}
              className="w-full py-3 bg-blue-500 hover:bg-blue-400 text-white font-medium rounded-xl transition disabled:opacity-40"
            >
              {allDiseases.length === 0 ? "Loading..." : "Start Game"}
            </button>
            <a
              href={`${process.env.NEXT_PUBLIC_BASE_PATH || ""}/`}
              className="block mt-4 text-xs text-white/40 hover:text-white/70 transition"
            >
              Back to Globe
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-screen bg-[#0a0a1a] overflow-hidden">
      {/* Globe */}
      <GameGlobe
        points={globePoints}
        showColors={showColors || roundEnded}
        zoomTarget={zoomClue?.zoomTo || null}
        roundEnded={roundEnded}
      />

      {/* HUD - top left */}
      <div className="absolute top-4 left-4 z-10">
        <GameHUD
          round={state.round}
          totalRounds={state.totalRounds}
          score={state.score}
        />
      </div>

      {/* Title - top center */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 pointer-events-none">
        <h1 className="text-lg font-bold text-white/80 drop-shadow-lg">
          Rare Disease Detective
        </h1>
      </div>

      {/* Clue Panel - top right */}
      {state.status === "playing" && (
        <div className="absolute top-4 right-4 z-10">
          <CluePanel
            clues={clues}
            revealedCount={state.clueIndex + 1}
            onRevealClue={handleRevealClue}
            canReveal={state.clueIndex < clues.length - 1}
          />
        </div>
      )}

      {/* Guess Input - bottom center */}
      {state.status === "playing" && (
        <div className="absolute bottom-6 left-4 right-4 z-10">
          <GuessInput
            diseaseList={diseaseList}
            guess={state.guess}
            onGuessChange={handleGuessChange}
            onSubmit={handleSubmit}
            onSkip={handleSkip}
            disabled={false}
            wrongFlash={wrongFlash}
          />
        </div>
      )}

      {/* Legend - bottom left */}
      {showColors && (
        <div className="absolute bottom-20 left-4 z-10 pointer-events-none">
          <div className="bg-black/60 backdrop-blur-sm rounded-lg px-3 py-2 border border-white/10">
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
      )}

      {/* Round Result / Game Over Modal */}
      {state.status === "roundResult" && (
        <RoundModal
          result={lastResult}
          isGameOver={false}
          allResults={state.roundHistory}
          totalScore={state.score}
          onNext={handleNext}
          onPlayAgain={handlePlayAgain}
        />
      )}

      {state.status === "gameOver" && (
        <RoundModal
          result={null}
          isGameOver={true}
          allResults={state.roundHistory}
          totalScore={state.score}
          onNext={handleNext}
          onPlayAgain={handlePlayAgain}
        />
      )}
    </div>
  );
}
