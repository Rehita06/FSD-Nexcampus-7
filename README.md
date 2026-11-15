# NexCampus – Smart Campus Guidance & Student Management System

The original NexCampus (Lab 5 & 6: React + TypeScript + Vite + Tailwind) upgraded with the Lab 7 MERN requirements:
an Express/Mongoose REST API, MongoDB persistence, a Student Registration module and live dashboard statistics.

| Layer    | Tech |
|----------|------|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS (original design preserved) |
| Backend  | Node.js, Express, Mongoose, dotenv, cors (`server/`) |
| Database | MongoDB (local or Atlas) |

## Project layout
```
src/                     React app (original pages/components + new ones)
  services/              http.ts, studentApi.ts, recordApi.ts, statsApi.ts
  pages/StudentsPage.tsx new Student Management page
  components/            StudentForm, ToastProvider, DataState, LiveDashboard (new) + original components
server/
  config/db.js           Mongo connection
  models/                Student, CampusRecord, Meta
  controllers/ routes/   students, records, stats
  middleware/            errorHandler, validateObjectId, asyncHandler
  services/seedRecords.js  one-time seeding of the original sample records
  data/sampleRecords.json  the 13 original sample records
  test/api.test.js       integration tests (node:test)
```

## Run locally
Requirements: Node 18+ and a MongoDB (local `mongod`, or a free MongoDB Atlas cluster).

```bash
# 1. install both packages
npm run install:all

# 2. configure the backend
cp server/.env.example server/.env
#    edit server/.env and set MONGODB_URI, e.g.
#    MONGODB_URI=mongodb://127.0.0.1:27017/nexcampus        (local)
#    MONGODB_URI=mongodb+srv://<user>:<pass>@<cluster>/nexcampus?retryWrites=true&w=majority   (Atlas)

# 3. start MongoDB if local (separate terminal):  mongod --dbpath ~/data/db

# 4. run API (port 5000) + frontend (port 5173) together
npm run dev:all
#    or separately:  npm run dev:server   and   npm run dev
```
Open http://localhost:5173. Vite proxies `/api` to the Express server, so no frontend config is needed in development.
On first start the server seeds the 13 original campus records **once** (a marker document prevents re-seeding, so restarts never duplicate them).

Other scripts: `npm run seed` · `npm run seed -- --reset` (restore the originals) · `npm run typecheck` · `npm run lint` · `npm run build` · `npm run test:server`.

### MongoDB Atlas
Create a free cluster → Database Access: add a user → Network Access: allow your IP (or `0.0.0.0/0` for a demo) → Connect → Drivers: copy the `mongodb+srv://…` string into `MONGODB_URI` (add the database name `/nexcampus`). Never commit `server/.env`.

## API
Base path `/api`. JSON in/out. Errors: `{ "message": "...", "errors": { "field": "..." } }`.

| Method | Path | Description | Success |
|---|---|---|---|
| POST | `/students` | Create student | 201 |
| GET | `/students` | List all students (newest first) | 200 |
| GET | `/students/search/:name` | Case-insensitive partial name search | 200 |
| GET | `/students/:id` | One student | 200 |
| PUT | `/students/:id` | Update student | 200 |
| DELETE | `/students/:id` | Delete student | 200 |
| GET | `/records` | List campus records (`?category=&audience=&q=`) | 200 |
| GET | `/records/:id` | One record | 200 |
| POST | `/records` | Create record | 201 |
| PUT | `/records/:id` | Update record | 200 |
| DELETE | `/records/:id` | Delete record | 200 |
| POST | `/records/reset-samples` | Restore the 13 original records | 200 |
| GET | `/stats` | Totals, department/category/audience distribution, 5 most recent students | 200 |
| GET | `/health` | API + database connection status | 200 / 503 |

Student body: `{ name, registerNumber, course, semester (1–12), department }`.
Status codes: 400 validation / invalid ObjectId / malformed JSON · 404 not found · 409 duplicate register number · 500 unexpected (generic message, details only in server log).

## Production / deployment
Express can serve the built frontend itself (single host):
```bash
npm run build
NODE_ENV=production PORT=5000 MONGODB_URI=... npm --prefix server start     # or: npm start
```
Host this on any Node host (Render, Railway, a VPS) with MongoDB Atlas. Netlify/Vercel/Bolt-style static hosting cannot run the Express server: if you host the frontend there, deploy `server/` separately, set `VITE_API_URL=https://<api-host>/api` at frontend build time and `CORS_ORIGIN=https://<frontend-host>` on the API.

## Notes
- Campus records and students live only in MongoDB. Local Storage is still used for UI preferences (theme, chat history, focus sessions, saved location).
- Records previously saved in a browser's Local Storage by the Lab 5 & 6 build are not auto-imported; use Admin to re-add them.
- The chat assistant is the original rule-based engine over your records; no external AI service is involved.
