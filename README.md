# SafeRoute / Safe-Atlas

Crime-aware route recommendation system with a FastAPI backend and a Vite + React frontend.

## Tech Stack

- Frontend: React 19, TypeScript, Vite, Tailwind CSS 4, Radix UI, Framer Motion, Leaflet / react-leaflet
- Backend: FastAPI, Pydantic, pandas, requests, Uvicorn
- Routing: OSRM public routing API
- Data / visualization: Folium heatmaps, crime scoring from CSV data

## Local Development

Backend:

```bash
cd SafeRoute
c:/Users/youwi/OneDrive/Desktop/heatmaps/.venv/Scripts/python.exe -m uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000
```

Frontend:

```bash
cd front/Safe-Atlas
npm run dev:client
```

## Vercel Deployment

Vercel should be connected to the frontend app in `front/Safe-Atlas`.

1. Set the Root Directory to `front/Safe-Atlas`.
2. Use `npm run build` as the build command.
3. Set the output directory to `dist/public`.
4. Add `VITE_API_BASE_URL` in Vercel Environment Variables so the frontend points to your hosted backend.

Important: Vercel will host the React frontend. The FastAPI backend is not deployed by this config and must be hosted separately.

## Git Push

After reviewing changes, push them with:

```bash
git add .
git commit -m "Improve route performance and add deployment setup"
git push
```