import { readFileSync, writeFileSync, mkdirSync } from "fs";
import { parseStringPromise } from "xml2js";

// Country name -> [lat, lng] centroid mapping
const GEO_COORDS: Record<string, [number, number]> = {
  Worldwide: [20, 0],
  Europe: [50, 10],
  Africa: [0, 25],
  Asia: [35, 105],
  "North America": [45, -100],
  "South America": [-15, -60],
  Oceania: [-25, 135],
  Algeria: [28.0, 3.0],
  Argentina: [-34.0, -64.0],
  Australia: [-25.0, 135.0],
  Austria: [47.3, 13.3],
  Bangladesh: [24.0, 90.0],
  Belgium: [50.8, 4.0],
  Bolivia: [-17.0, -65.0],
  Brazil: [-10.0, -55.0],
  Bulgaria: [42.7, 25.5],
  Canada: [56.0, -96.0],
  Chile: [-30.0, -71.0],
  China: [35.0, 105.0],
  Colombia: [4.0, -72.0],
  "Costa Rica": [10.0, -84.0],
  Croatia: [45.2, 15.5],
  Cuba: [22.0, -79.5],
  "Czech Republic": [49.8, 15.5],
  Denmark: [56.0, 10.0],
  "Dominican Republic": [19.0, -70.7],
  Ecuador: [-2.0, -77.5],
  Egypt: [27.0, 30.0],
  Estonia: [59.0, 26.0],
  Ethiopia: [8.0, 38.0],
  Finland: [64.0, 26.0],
  France: [46.0, 2.0],
  Germany: [51.0, 9.0],
  Greece: [39.0, 22.0],
  "Guadeloupe [France]": [16.2, -61.5],
  Guatemala: [15.5, -90.3],
  Hungary: [47.0, 20.0],
  Iceland: [65.0, -18.0],
  India: [22.0, 78.0],
  Indonesia: [-5.0, 120.0],
  Iran: [32.0, 53.0],
  "Iran, Islamic Republic of": [32.0, 53.0],
  Iraq: [33.0, 44.0],
  Ireland: [53.0, -8.0],
  Israel: [31.5, 34.8],
  Italy: [42.8, 12.8],
  Japan: [36.0, 138.0],
  Jordan: [31.0, 36.0],
  Kenya: [1.0, 38.0],
  "Korea, Republic of": [36.0, 128.0],
  Kuwait: [29.5, 47.8],
  Latvia: [57.0, 25.0],
  Lebanon: [33.9, 35.8],
  Libya: [27.0, 17.0],
  Lithuania: [56.0, 24.0],
  Luxembourg: [49.8, 6.1],
  Malaysia: [2.5, 112.5],
  Malta: [35.9, 14.4],
  Mexico: [23.0, -102.0],
  Morocco: [32.0, -5.0],
  Netherlands: [52.5, 5.8],
  "New Zealand": [-42.0, 174.0],
  Nigeria: [10.0, 8.0],
  Norway: [62.0, 10.0],
  Oman: [21.0, 57.0],
  Pakistan: [30.0, 70.0],
  Panama: [9.0, -80.0],
  Peru: [-10.0, -76.0],
  Philippines: [13.0, 122.0],
  Poland: [52.0, 20.0],
  Portugal: [39.5, -8.0],
  Qatar: [25.5, 51.3],
  Romania: [46.0, 25.0],
  "Russian Federation": [60.0, 100.0],
  "Saudi Arabia": [24.0, 45.0],
  Senegal: [14.5, -14.5],
  Serbia: [44.0, 21.0],
  Singapore: [1.4, 103.8],
  Slovakia: [48.7, 19.7],
  Slovenia: [46.1, 14.8],
  "South Africa": [-29.0, 24.0],
  Spain: [40.0, -4.0],
  "Sri Lanka": [7.0, 81.0],
  Sudan: [15.0, 30.0],
  Sweden: [62.0, 15.0],
  Switzerland: [47.0, 8.0],
  "Syrian Arab Republic": [35.0, 38.0],
  Taiwan: [23.7, 121.0],
  "Taiwan, Province of China": [23.7, 121.0],
  Thailand: [15.0, 100.0],
  Tunisia: [34.0, 9.0],
  Turkey: [39.0, 35.0],
  "Türkiye": [39.0, 35.0],
  Ukraine: [49.0, 32.0],
  "United Arab Emirates": [24.0, 54.0],
  "United Kingdom": [54.0, -2.0],
  "United States": [39.8, -98.5],
  Uruguay: [-33.0, -56.0],
  Venezuela: [8.0, -66.0],
  "Viet Nam": [16.0, 108.0],
  Albania: [41.0, 20.0],
  Armenia: [40.0, 45.0],
  Azerbaijan: [40.5, 47.5],
  Bahrain: [26.0, 50.5],
  Belarus: [53.0, 28.0],
  Belize: [17.2, -88.7],
  "Bosnia and Herzegovina": [44.0, 17.8],
  "Brunei Darussalam": [4.5, 114.7],
  Cameroon: [6.0, 12.0],
  "Costa rica": [10.0, -84.0],
  Cyprus: [35.0, 33.0],
  "El Salvador": [13.8, -88.9],
  Eritrea: [15.3, 39.0],
  "Faroe Islands": [62.0, -7.0],
  "French Polynesia": [-17.7, -149.4],
  Georgia: [42.3, 43.4],
  Greenland: [72.0, -40.0],
  Guadeloupe: [16.2, -61.5],
  Guyana: [5.0, -59.0],
  Haiti: [19.0, -72.0],
  Honduras: [14.1, -87.2],
  "Hong Kong": [22.3, 114.2],
  Jamaica: [18.1, -77.3],
  "Korea, Democratic People's Republic of": [40.0, 127.0],
  "Latin America": [-15.0, -60.0],
  Lesotho: [-29.5, 28.5],
  "Libyan Arab Jamahiriya": [27.0, 17.0],
  Liechtenstein: [47.2, 9.5],
  Martinique: [14.6, -61.0],
  Mauritania: [20.0, -12.0],
  "Moldova, Republic of": [47.0, 28.8],
  Mongolia: [46.0, 105.0],
  Nepal: [28.4, 84.1],
  "New Caledonia": [-21.5, 165.6],
  Nicaragua: [12.9, -85.2],
  "North Macedonia": [41.5, 21.7],
  "Palestinian Territory, occupied": [31.9, 35.2],
  Paraguay: [-23.0, -58.0],
  "Puerto rico": [18.2, -66.5],
  Reunion: [-21.1, 55.5],
  "Sierra leone": [8.5, -11.8],
  "South East Asia": [10.0, 106.0],
  "Eastern Mediterranean Asia": [30.0, 50.0],
  "Specific population": [20.0, 0.0],
  "Tanzania, United Republic of": [-6.0, 35.0],
  Togo: [8.6, 1.2],
  Uganda: [1.4, 32.3],
  Uzbekistan: [41.0, 64.6],
  "Western Asia": [33.0, 44.0],
  Zimbabwe: [-20.0, 30.0],
};

// Map prevalence class string to a numeric score for visualization
function prevalenceToScore(cls: string): number {
  if (!cls) return 0;
  if (cls.includes(">1 / 1000")) return 6;
  if (cls.includes("1-5 / 10 000")) return 5;
  if (cls.includes("6-9 / 10 000")) return 5.5;
  if (cls.includes("1-9 / 10 000")) return 5;
  if (cls.includes("1-9 / 100 000")) return 4;
  if (cls.includes("1-9 / 1 000 000")) return 3;
  if (cls.includes("<1 / 1 000 000")) return 2;
  if (cls.includes("Not yet documented")) return 0;
  if (cls.includes("Unknown")) return 0;
  return 1;
}

interface PrevalenceEntry {
  region: string;
  type: string;
  class: string;
  score: number;
  valMoy: number;
  lat: number;
  lng: number;
}

interface DiseaseRecord {
  orphaCode: string;
  name: string;
  type: string;
  prevalences: PrevalenceEntry[];
}

async function main() {
  const xml = readFileSync("data/en_product9_prev.xml", "utf-8");
  const result = await parseStringPromise(xml, { explicitArray: false });

  const disorders = result.JDBOR.DisorderList.Disorder;
  const diseases: DiseaseRecord[] = [];
  const regionSet = new Set<string>();

  for (const d of Array.isArray(disorders) ? disorders : [disorders]) {
    const orphaCode = d.OrphaCode;
    const name = d.Name?._ || d.Name;
    const disorderType = d.DisorderType?.Name?._ || d.DisorderType?.Name || "";

    const prevList = d.PrevalenceList?.Prevalence;
    if (!prevList) continue;

    const prevalences: PrevalenceEntry[] = [];
    const items = Array.isArray(prevList) ? prevList : [prevList];

    for (const p of items) {
      const region =
        p.PrevalenceGeographic?.Name?._ || p.PrevalenceGeographic?.Name || "";
      const prevType = p.PrevalenceType?.Name?._ || p.PrevalenceType?.Name || "";
      const prevClass =
        p.PrevalenceClass?.Name?._ || p.PrevalenceClass?.Name || "";
      const valMoy = parseFloat(p.ValMoy) || 0;

      regionSet.add(region);

      // Skip entries without geographic coordinates
      if (!region || !GEO_COORDS[region]) continue;
      // Focus on point prevalence for the globe visualization
      if (prevType !== "Point prevalence") continue;

      const score = prevalenceToScore(prevClass);
      if (score === 0) continue;

      const [lat, lng] = GEO_COORDS[region];
      prevalences.push({
        region,
        type: prevType,
        class: prevClass,
        score,
        valMoy,
        lat,
        lng,
      });
    }

    if (prevalences.length > 0) {
      diseases.push({ orphaCode, name, type: disorderType, prevalences });
    }
  }

  // Sort by number of geographic entries (most data-rich first)
  diseases.sort((a, b) => b.prevalences.length - a.prevalences.length);

  // Generate globe-ready data: flatten to per-region points
  const globePoints: {
    lat: number;
    lng: number;
    region: string;
    disease: string;
    orphaCode: string;
    prevalenceClass: string;
    score: number;
  }[] = [];

  for (const d of diseases) {
    for (const p of d.prevalences) {
      // Skip "Worldwide" and "Europe" for globe points — too broad
      if (p.region === "Worldwide" || p.region === "Europe") continue;
      globePoints.push({
        lat: p.lat + (Math.random() - 0.5) * 2, // jitter to avoid overlap
        lng: p.lng + (Math.random() - 0.5) * 2,
        region: p.region,
        disease: d.name,
        orphaCode: d.orphaCode,
        prevalenceClass: p.class,
        score: p.score,
      });
    }
  }

  // Summary stats
  console.log(`Total diseases with prevalence data: ${diseases.length}`);
  console.log(`Total globe points (country-level): ${globePoints.length}`);
  console.log(
    `Top 10 most data-rich diseases:`,
    diseases.slice(0, 10).map((d) => `${d.name} (${d.prevalences.length} regions)`)
  );
  console.log(
    `Unmapped regions:`,
    [...regionSet].filter((r) => !GEO_COORDS[r]).sort()
  );

  // Write outputs
  mkdirSync("public/data", { recursive: true });
  writeFileSync(
    "public/data/diseases.json",
    JSON.stringify(diseases, null, 2)
  );
  writeFileSync(
    "public/data/globe-points.json",
    JSON.stringify(globePoints)
  );

  // Disease list for search (lightweight)
  const diseaseList = diseases.map((d) => ({
    orphaCode: d.orphaCode,
    name: d.name,
    regionCount: d.prevalences.filter(
      (p) => p.region !== "Worldwide" && p.region !== "Europe"
    ).length,
    totalRegions: d.prevalences.length,
  }));
  writeFileSync(
    "public/data/disease-list.json",
    JSON.stringify(diseaseList)
  );

  console.log("Done! Files written to public/data/");
}

main().catch(console.error);
