#!/usr/bin/env bash
set -e
mkdir -p music-learning-academy/{public/icons,src/{app,assets,components/layout,content/academies/music,domain,features/quiz,pages,services,store,styles,types}}
cd music-learning-academy

# root files
touch package.json tsconfig.json tsconfig.node.json vite.config.ts \
  tailwind.config.ts postcss.config.js index.html .gitignore README.md

# public
touch public/manifest.webmanifest

# src entry/styles
touch src/main.tsx src/vite-env.d.ts src/styles/globals.css

# domain
touch src/domain/models.ts src/domain/progress.ts src/domain/scoring.ts src/domain/certification.ts

# store
touch src/store/useThemeStore.ts src/store/useAuthStore.ts src/store/useProgressStore.ts

# content
touch src/content/academies/index.ts src/content/academies/music/course.ts

# app + components
touch src/app/App.tsx src/app/router.tsx \
  src/components/layout/Navbar.tsx src/components/ThemeToggle.tsx src/components/ProgressRing.tsx

# features + pages
touch src/features/quiz/QuizRunner.tsx \
  src/pages/Landing.tsx src/pages/Login.tsx src/pages/Dashboard.tsx \
  src/pages/Lesson.tsx src/pages/QuizPage.tsx src/pages/ExamPage.tsx src/pages/CertificatePage.tsx

echo "✅ Tree created. Now paste each file's contents, then run: npm install && npm run dev"