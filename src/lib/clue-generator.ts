import { Clue, DiseaseRecord, PrevalenceEntry } from "@/types/game";

const CONTINENT_MAP: Record<string, string> = {
  France: "Europe", Germany: "Europe", Italy: "Europe", Spain: "Europe",
  "United Kingdom": "Europe", Netherlands: "Europe", Belgium: "Europe",
  Sweden: "Europe", Norway: "Europe", Denmark: "Europe", Finland: "Europe",
  Poland: "Europe", Austria: "Europe", Switzerland: "Europe", Ireland: "Europe",
  Portugal: "Europe", Greece: "Europe", "Czech Republic": "Europe",
  Hungary: "Europe", Romania: "Europe", Bulgaria: "Europe", Croatia: "Europe",
  Serbia: "Europe", Slovakia: "Europe", Slovenia: "Europe", Estonia: "Europe",
  Latvia: "Europe", Lithuania: "Europe", Luxembourg: "Europe", Malta: "Europe",
  Iceland: "Europe", Cyprus: "Europe", Albania: "Europe", Armenia: "Europe",
  Azerbaijan: "Europe", Belarus: "Europe", "Bosnia and Herzegovina": "Europe",
  Georgia: "Europe", "North Macedonia": "Europe", Ukraine: "Europe",
  "Russian Federation": "Europe", Liechtenstein: "Europe",
  "Moldova, Republic of": "Europe", "Faroe Islands": "Europe",

  "United States": "North America", Canada: "North America", Mexico: "North America",
  Cuba: "North America", "Costa Rica": "North America", "Costa rica": "North America",
  Guatemala: "North America", Honduras: "North America", "El Salvador": "North America",
  Nicaragua: "North America", Panama: "North America", Belize: "North America",
  "Dominican Republic": "North America", Jamaica: "North America", Haiti: "North America",
  "Puerto rico": "North America",

  Brazil: "South America", Argentina: "South America", Chile: "South America",
  Colombia: "South America", Peru: "South America", Ecuador: "South America",
  Bolivia: "South America", Uruguay: "South America", Venezuela: "South America",
  Paraguay: "South America", Guyana: "South America",

  China: "Asia", Japan: "Asia", India: "Asia", "Korea, Republic of": "Asia",
  Taiwan: "Asia", "Taiwan, Province of China": "Asia", Thailand: "Asia",
  Indonesia: "Asia", Malaysia: "Asia", Philippines: "Asia", "Viet Nam": "Asia",
  Bangladesh: "Asia", Pakistan: "Asia", Iran: "Asia",
  "Iran, Islamic Republic of": "Asia", Iraq: "Asia", Israel: "Asia",
  Jordan: "Asia", Kuwait: "Asia", Lebanon: "Asia", Oman: "Asia",
  Qatar: "Asia", "Saudi Arabia": "Asia", Singapore: "Asia",
  "Sri Lanka": "Asia", "Syrian Arab Republic": "Asia", Turkey: "Asia",
  "Türkiye": "Asia", "United Arab Emirates": "Asia", Bahrain: "Asia",
  "Brunei Darussalam": "Asia", Mongolia: "Asia", Nepal: "Asia",
  Uzbekistan: "Asia", "Hong Kong": "Asia",
  "Korea, Democratic People's Republic of": "Asia",

  Australia: "Oceania", "New Zealand": "Oceania",
  "French Polynesia": "Oceania", "New Caledonia": "Oceania",

  Algeria: "Africa", Egypt: "Africa", Ethiopia: "Africa", Kenya: "Africa",
  Libya: "Africa", Morocco: "Africa", Nigeria: "Africa", Senegal: "Africa",
  "South Africa": "Africa", Sudan: "Africa", Tunisia: "Africa",
  Cameroon: "Africa", Eritrea: "Africa", Lesotho: "Africa",
  "Libyan Arab Jamahiriya": "Africa", Mauritania: "Africa",
  "Sierra leone": "Africa", "Tanzania, United Republic of": "Africa",
  Togo: "Africa", Uganda: "Africa", Zimbabwe: "Africa",
};

function getCountryPrevalences(disease: DiseaseRecord): PrevalenceEntry[] {
  return disease.prevalences.filter(
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
  );
}

function getDominantContinent(entries: PrevalenceEntry[]): string {
  const counts: Record<string, number> = {};
  for (const e of entries) {
    const cont = CONTINENT_MAP[e.region];
    if (cont) counts[cont] = (counts[cont] || 0) + 1;
  }
  let best = "multiple continents";
  let max = 0;
  for (const [cont, n] of Object.entries(counts)) {
    if (n > max) { max = n; best = cont; }
  }
  const total = entries.length;
  if (max < total * 0.4) return "multiple continents";
  return best;
}

function getContinentList(entries: PrevalenceEntry[]): string[] {
  const set = new Set<string>();
  for (const e of entries) {
    const cont = CONTINENT_MAP[e.region];
    if (cont) set.add(cont);
  }
  return [...set].sort();
}

const PREVALENCE_LABELS: Record<number, string> = {
  2: "less than 1 in 1,000,000",
  3: "1-9 in 1,000,000",
  4: "1-9 in 100,000",
  5: "1-5 in 10,000",
  5.5: "6-9 in 10,000",
  6: "more than 1 in 1,000",
};

function formatType(type: string): string {
  const map: Record<string, string> = {
    Disease: "a disease",
    "Clinical group": "a clinical group",
    "Morphological anomaly": "a morphological anomaly",
    Category: "a disease category",
    "Clinical subtype": "a clinical subtype",
    "Etiological subtype": "an etiological subtype",
    "Malformation syndrome": "a malformation syndrome",
    "Particular clinical situation in a disease or syndrome": "a particular clinical situation",
    "Biological anomaly": "a biological anomaly",
    "Clinical syndrome": "a clinical syndrome",
    "Histopathological subtype": "a histopathological subtype",
  };
  return map[type] || `classified as "${type}"`;
}

export function generateClues(disease: DiseaseRecord): Clue[] {
  const clues: Clue[] = [];
  const countryEntries = getCountryPrevalences(disease);
  const worldwide = disease.prevalences.find((p) => p.region === "Worldwide");

  // Clue 1: Classification
  clues.push({
    type: "classification",
    text: `This condition is classified as ${formatType(disease.type)}.`,
  });

  // Clue 2: Overall prevalence
  if (worldwide) {
    const label = PREVALENCE_LABELS[worldwide.score] || worldwide.class;
    clues.push({
      type: "prevalence",
      text: `Worldwide prevalence is estimated at ${label}.`,
    });
  } else {
    const scores = countryEntries.map((e) => e.score);
    const median = scores.sort((a, b) => a - b)[Math.floor(scores.length / 2)];
    const label = PREVALENCE_LABELS[median] || "unknown";
    clues.push({
      type: "prevalence",
      text: `Typical reported prevalence across countries is around ${label}.`,
    });
  }

  // Clue 3: Geography — reveal anonymous dots
  const dominant = getDominantContinent(countryEntries);
  const continents = getContinentList(countryEntries);
  const geoDetail =
    dominant === "multiple continents"
      ? `spanning ${continents.slice(0, 3).join(", ")}${continents.length > 3 ? " and more" : ""}`
      : `predominantly in ${dominant}`;
  clues.push({
    type: "geography",
    text: `Prevalence data reported in ${countryEntries.length} countries/regions, ${geoDetail}.`,
    revealPoints: true,
  });

  // Clue 4: Hotspot — zoom to highest prevalence region
  const sorted = [...countryEntries].sort((a, b) => b.valMoy - a.valMoy);
  const hotspot = sorted[0];
  if (hotspot) {
    const label = PREVALENCE_LABELS[hotspot.score] || hotspot.class;
    clues.push({
      type: "hotspot",
      text: `Highest reported prevalence: ${hotspot.region} (${label}).`,
      zoomTo: { lat: hotspot.lat, lng: hotspot.lng },
    });
  } else {
    clues.push({
      type: "hotspot",
      text: `Prevalence data is limited; no clear geographic hotspot identified.`,
    });
  }

  // Clue 5: Full pattern — reveal colors
  const lowest = sorted[sorted.length - 1];
  if (sorted.length >= 2 && hotspot && lowest && hotspot.region !== lowest.region) {
    const highLabel = PREVALENCE_LABELS[hotspot.score] || hotspot.class;
    const lowLabel = PREVALENCE_LABELS[lowest.score] || lowest.class;
    clues.push({
      type: "pattern",
      text: `Prevalence ranges from ${lowLabel} in ${lowest.region} to ${highLabel} in ${hotspot.region}.`,
      revealColors: true,
    });
  } else {
    const regions = countryEntries.slice(0, 4).map((e) => e.region);
    clues.push({
      type: "pattern",
      text: `Reported in: ${regions.join(", ")}${countryEntries.length > 4 ? ` and ${countryEntries.length - 4} more` : ""}.`,
      revealColors: true,
    });
  }

  return clues;
}

export function selectGameDiseases(
  all: DiseaseRecord[],
  count: number
): DiseaseRecord[] {
  // Filter to diseases with enough country-level data for interesting clues
  const eligible = all.filter((d) => {
    const countries = getCountryPrevalences(d);
    return countries.length >= 3;
  });

  // Shuffle using Fisher-Yates
  const shuffled = [...eligible];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return shuffled.slice(0, count);
}
