#!/bin/bash
cd backend && npm run build && npx tsx src/main.ts &
cd ../
npm run dev -- --host 0.0.0.0 --port 5173
