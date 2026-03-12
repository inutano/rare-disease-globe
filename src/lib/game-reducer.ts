import { GameState, GameAction, DiseaseRecord } from "@/types/game";
import { selectGameDiseases } from "./clue-generator";

const TOTAL_ROUNDS = 5;
const MAX_CLUES = 5;

function pickNextDisease(state: GameState): DiseaseRecord | null {
  const available = state.eligibleDiseases.filter(
    (d) => !state.usedOrphaCodes.has(d.orphaCode)
  );
  if (available.length === 0) return null;
  return available[Math.floor(Math.random() * available.length)];
}

function calcPoints(cluesUsed: number): number {
  return Math.max(0, (MAX_CLUES + 1 - cluesUsed) * 100);
}

export const initialGameState: GameState = {
  status: "menu",
  round: 0,
  totalRounds: TOTAL_ROUNDS,
  clueIndex: 0,
  targetDisease: null,
  guess: "",
  roundHistory: [],
  score: 0,
  eligibleDiseases: [],
  usedOrphaCodes: new Set(),
};

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case "START_GAME": {
      const eligible = selectGameDiseases(action.diseases, TOTAL_ROUNDS + 5);
      const first = eligible[0] || null;
      return {
        ...state,
        status: "playing",
        round: 1,
        totalRounds: TOTAL_ROUNDS,
        clueIndex: 0,
        targetDisease: first,
        guess: "",
        roundHistory: [],
        score: 0,
        eligibleDiseases: eligible,
        usedOrphaCodes: first
          ? new Set([first.orphaCode])
          : new Set(),
      };
    }

    case "REVEAL_CLUE": {
      if (state.clueIndex >= MAX_CLUES - 1) return state;
      return { ...state, clueIndex: state.clueIndex + 1 };
    }

    case "SET_GUESS": {
      return { ...state, guess: action.guess };
    }

    case "SUBMIT_GUESS": {
      if (!state.targetDisease) return state;
      const cluesUsed = state.clueIndex + 1;
      const points = action.correct ? calcPoints(cluesUsed) : 0;
      const result = {
        disease: state.targetDisease,
        cluesUsed,
        correct: action.correct,
        pointsEarned: points,
      };

      if (action.correct) {
        return {
          ...state,
          status: "roundResult",
          score: state.score + points,
          roundHistory: [...state.roundHistory, result],
        };
      }

      // Wrong guess: auto-reveal next clue, clear guess
      if (state.clueIndex < MAX_CLUES - 1) {
        return {
          ...state,
          clueIndex: state.clueIndex + 1,
          guess: "",
        };
      }

      // All clues used and still wrong — end the round
      return {
        ...state,
        status: "roundResult",
        roundHistory: [...state.roundHistory, result],
      };
    }

    case "SKIP_ROUND": {
      if (!state.targetDisease) return state;
      const result = {
        disease: state.targetDisease,
        cluesUsed: state.clueIndex + 1,
        correct: false,
        pointsEarned: 0,
      };
      return {
        ...state,
        status: "roundResult",
        roundHistory: [...state.roundHistory, result],
      };
    }

    case "NEXT_ROUND": {
      if (state.round >= state.totalRounds) {
        return { ...state, status: "gameOver" };
      }
      const next = pickNextDisease(state);
      const newUsed = new Set(state.usedOrphaCodes);
      if (next) newUsed.add(next.orphaCode);
      return {
        ...state,
        status: "playing",
        round: state.round + 1,
        clueIndex: 0,
        targetDisease: next,
        guess: "",
        usedOrphaCodes: newUsed,
      };
    }

    case "RESET_GAME": {
      return { ...initialGameState };
    }

    default:
      return state;
  }
}
