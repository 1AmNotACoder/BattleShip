# Battleship

A browser-based Battleship game built with React, TypeScript, Vite, and Tailwind CSS. Play against an AI opponent with hunt/target logic.

## Features

- Two 10x10 boards: Your Fleet and Enemy Waters
- Standard ships: Carrier (5), Battleship (4), Cruiser (3), Submarine (3), Destroyer (2)
- Click-to-place ships with hover preview; press **R** to rotate orientation
- Random placement option for quick starts
- AI opponent uses hunt/target strategy (random shots, then targets adjacent cells on hit until sink)
- Hit/miss/sunk visual feedback with color coding
- Win/loss detection with Play Again button
- Reset game at any time

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Install dependencies

```bash
npm install
```

### Run the dev server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Build for production

```bash
npm run build
```

The output is in the `dist/` folder.

### Run tests

```bash
npx vitest run
```

## How to Play

1. **Place ships**: Hover over your board to see a placement preview (green = valid, red = invalid). Click to place. Press **R** or click the Orientation button to toggle horizontal/vertical.
2. **Fire**: Click any cell on the Enemy Waters board. Hits show red, misses show gray, sunk ships show dark red.
3. **AI responds**: After each shot, the AI fires back automatically.
4. **Win**: Sink all 5 enemy ships before the AI sinks yours.

## Tech Stack

- React 18 + TypeScript
- Vite
- Tailwind CSS
