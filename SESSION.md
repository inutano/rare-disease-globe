# Rare Disease Globe — Build Session Log

## Overview

An interactive 3D globe visualization of rare disease prevalence data, inspired by [a viral project](https://youtu.be/1oIUrEZ8j5s) that mapped ~5,000 British Museum artifacts to their countries of origin on a 3D Earth. We adapted the concept to biomedical public data — specifically rare disease prevalence from Orphanet/Orphadata.

**Live site:** https://inutano.github.io/rare-disease-globe/
**Repository:** https://github.com/inutano/rare-disease-globe

## Session Prompts

### 1. Research & Planning
> "i found an interesting visualization project. it is available at youtube https://youtu.be/1oIUrEZ8j5s but basically it is a information mapping to the earth 3d model. my colleague wants to have a similar vis of the biomedical public resources, such as the rare disease patients distribution. Let's plan the implementation, we can do it. First, fetch the relevant information and know how they build it, and make a plan please."

- Identified the reference project: "If All Artifacts Returned Home" by a Chinese MIT student — maps ~5,000 British Museum artifacts onto a 3D globe by country of origin
- Chose tech stack: Next.js + react-globe.gl (Three.js/WebGL)
- Identified data source: Orphadata (Orphanet) CC-BY-4.0 epidemiological datasets
- Outlined a 4-phase implementation plan

### 2. Scaffold & Build
> "Yes please."

- Created Next.js app with TypeScript and Tailwind CSS
- Downloaded Orphadata prevalence XML (6,443 disorders, 15MB)
- Built `scripts/parse-orphadata.ts` to parse XML → JSON:
  - Mapped country/region names to lat/lng coordinates
  - Extracted point prevalence data with severity scoring
  - Output: 4,549 diseases, 1,690 country-level data points
- Built `src/components/Globe.tsx` with:
  - 3D rotating Earth with texture, bump map, atmosphere, starfield
  - Color-coded prevalence pillars (blue→cyan→yellow→orange→red)
  - Hover tooltips showing disease name, country, prevalence class, ORPHA code
  - Search/filter panel by disease name or ORPHA code
  - Click-to-zoom on selected disease
  - Prevalence legend

### 3. Network Access
> "i am connecting via my tailscale network but looks like i cannot connect to the server"

- Changed dev server to bind `0.0.0.0` instead of localhost-only (`next dev --hostname 0.0.0.0`)

### 4. Deployment
> "looks great! can i deploy this app somewhere so I can give access to my colleagues? what is the easiest way?"

- Recommended Vercel (easiest for Next.js) or static export for GitHub Pages

> "let's do it in github pages. you can create a repo for this"

- Configured Next.js for static export (`output: "export"`)
- Created GitHub Actions workflow (`.github/workflows/deploy.yml`)
- Created public repo `inutano/rare-disease-globe`
- Added `workflow` scope to GitHub CLI auth
- Pushed and deployed to GitHub Pages

### 5. Bug Fix
> "hmm. i could see the earth 3d but no data shown there. can you check?"

- Diagnosed: `fetch("/data/...")` was missing the `/rare-disease-globe` base path prefix on GitHub Pages
- Fixed by using `NEXT_PUBLIC_BASE_PATH` environment variable for data fetch URLs
- Redeployed — data points now visible on the globe

## Tech Stack

| Component | Technology |
|-----------|-----------|
| Framework | Next.js 16 (static export) |
| 3D Globe | react-globe.gl (Three.js/WebGL) |
| Styling | Tailwind CSS |
| Data Source | Orphadata (Orphanet) CC-BY-4.0 |
| Data Processing | TypeScript script with xml2js |
| Hosting | GitHub Pages via Actions |

## Session 2: Rare Disease Detective Game

### 6. Game Concept
> "One of my colleagues really liked it and told me if you can build a game on it. I have no idea what kind of gaming app running on this vis but maybe you have an idea?"

- Brainstormed 4 game concepts that fit the globe visualization:
  1. **Rare Disease Detective** — progressive clue-based mystery/quiz (recommended)
  2. **Prevalence Pinpoint** — GeoGuesser-style location guessing
  3. **Outbreak!** — time-trial country clicking
  4. **Connect the Dots** — pattern matching multiple-choice
- User chose #1: Rare Disease Detective

### 7. Game Implementation
> "yes, let's make #1"

- Planned architecture: separate `/game` route, new components, pure game logic in lib modules
- Analyzed data: 142 diseases with 3+ country-level data points eligible for the game
- Built 11 files (1,178 lines of new code):

| File | Purpose |
|------|---------|
| `src/types/game.ts` | Shared TypeScript interfaces (GameState, Clue, RoundResult, etc.) |
| `src/lib/clue-generator.ts` | Generates 5 progressive clues from disease data with continent detection |
| `src/lib/game-reducer.ts` | useReducer state machine for game flow (menu → playing → roundResult → gameOver) |
| `src/components/GameGlobe.tsx` | Game-mode globe wrapper (hides disease names, controls point visibility) |
| `src/components/CluePanel.tsx` | Right-side panel showing revealed clues with icons and progress dots |
| `src/components/GuessInput.tsx` | Autocomplete input with disease list dropdown, shake animation on wrong guess |
| `src/components/GameHUD.tsx` | Round counter and score display |
| `src/components/RoundModal.tsx` | Between-round results and game-over summary with per-round breakdown |
| `src/app/game/page.tsx` | Game page orchestrator wiring state, clues, globe, and UI components |
| `src/app/globals.css` | Added shake and fade-in CSS animations |
| `src/components/Globe.tsx` | Added "Play Detective" navigation link |

#### Game Design
- **5 rounds** per game, **5 clues** per round
- Clue progression (hardest → easiest):
  1. Disease classification (disease, syndrome, anomaly...)
  2. Worldwide prevalence range
  3. Geographic scope — grey dots appear on the globe
  4. Hotspot country — globe zooms to highest prevalence region
  5. Full prevalence pattern — color-coded dots revealed
- **Scoring:** 500 pts (1 clue) → 400 → 300 → 200 → 100 pts (5 clues), max 2,500
- Wrong guesses auto-reveal the next clue
- No new npm dependencies — built entirely on existing stack

### 8. Deployment
> "let's deploy it to the github pages"

- Committed and pushed to main
- Initial deploy failed due to transient GitHub Actions 401 error (infrastructure issue)
- Reran workflow — deployed successfully

**Live game:** https://inutano.github.io/rare-disease-globe/game

## Data Stats

- **4,549** rare diseases with prevalence data
- **1,690** country-level data points on the globe
- **~70** countries/regions mapped
- **142** diseases eligible for the detective game (3+ country-level entries)
- Prevalence classes from `<1/1,000,000` to `>1/1,000`
