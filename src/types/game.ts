export interface PrevalenceEntry {
  region: string;
  type: string;
  class: string;
  score: number;
  valMoy: number;
  lat: number;
  lng: number;
}

export interface DiseaseRecord {
  orphaCode: string;
  name: string;
  type: string;
  prevalences: PrevalenceEntry[];
}

export interface GlobePoint {
  lat: number;
  lng: number;
  region: string;
  disease: string;
  orphaCode: string;
  prevalenceClass: string;
  score: number;
}

export interface DiseaseListItem {
  orphaCode: string;
  name: string;
  regionCount: number;
  totalRegions: number;
}

export interface Clue {
  type: "classification" | "prevalence" | "geography" | "hotspot" | "pattern";
  text: string;
  revealPoints?: boolean;
  revealColors?: boolean;
  zoomTo?: { lat: number; lng: number };
}

export interface RoundResult {
  disease: DiseaseRecord;
  cluesUsed: number;
  correct: boolean;
  pointsEarned: number;
}

export interface GameState {
  status: "menu" | "playing" | "roundResult" | "gameOver";
  round: number;
  totalRounds: number;
  clueIndex: number;
  targetDisease: DiseaseRecord | null;
  guess: string;
  roundHistory: RoundResult[];
  score: number;
  eligibleDiseases: DiseaseRecord[];
  usedOrphaCodes: Set<string>;
}

export type GameAction =
  | { type: "START_GAME"; diseases: DiseaseRecord[] }
  | { type: "REVEAL_CLUE" }
  | { type: "SET_GUESS"; guess: string }
  | { type: "SUBMIT_GUESS"; correct: boolean }
  | { type: "SKIP_ROUND" }
  | { type: "NEXT_ROUND" }
  | { type: "RESET_GAME" };
