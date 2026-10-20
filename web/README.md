# Learning Academy

Data-driven, sequential course platform (React + TS + Tailwind + Vite, PWA-ready).

## Quick start

npm run dev

npm install

Open http://localhost:5173

## Build & deploy

npm run build      # outputs dist/

npm run preview    # preview the production build

- Vercel/Netlify: import repo, framework = Vite, output `dist`.
- GitHub Pages: set `base: "/<repo>/"` in `vite.config.ts`, deploy `dist`.

## Add a new course/academy (no code changes elsewhere)

1. Create `src/content/academies/<name>/course.ts` exporting a `Course`.
2. Register it in `src/content/academies/index.ts`.

## Architecture

- `domain/` pure business rules (unlock, scoring, certification)
- `store/` Zustand stores persisted to LocalStorage (swap persistence for a backend later)
- `content/` course data
- `pages/` + `features/` UI

## Mobile (Capacitor)

npm i @capacitor/core @capacitor/cli

npx cap init "Academy" com.academy.app

npm run build && npx cap add android && npx cap add ios && npx cap copy
