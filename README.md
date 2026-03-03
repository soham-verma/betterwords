# BetterWords

**Word, rebuilt for 2026.** A cloud-native collaborative document editor for the web.

## Features

- **Essential editing:** Headings (H1–H4), paragraph, bold/italic/underline, bullet & numbered lists, tables, images
- **Real-time collaboration:** Multi-user editing with Yjs over WebSockets
- **Sharing:** Share by link with viewer/editor roles
- **Minimal UI:** Toolbar, command palette (Ctrl+K / Cmd+K), dark/light theme, distraction-free mode
- **Export:** Download document as JSON (Tiptap format)

## Stack

- **Frontend:** React 18, Vite, TypeScript, Tailwind CSS, Tiptap, Yjs
- **Backend:** Node.js, Express, WebSocket (ws), Yjs, PostgreSQL
- **Auth:** Google OAuth2, JWT

## Prerequisites

- Node.js 18+
- PostgreSQL (local or hosted)

## Setup

1. **Clone and install**

   ```bash
   cd betterwords
   npm install
   ```

2. **Database**

   Create a database and run migrations:

   ```bash
   createdb betterwords   # or use your DB URL
   npm run db:migrate
   ```

3. **Environment**

   Copy env example and set variables:

   ```bash
   cp apps/api/.env.example apps/api/.env
   ```

   **API (`apps/api/.env`):**

   | Variable | Description |
   |----------|-------------|
   | `DATABASE_URL` | PostgreSQL connection string (e.g. `postgresql://localhost:5432/betterwords`) |
   | `JWT_SECRET` | Secret for signing JWTs (use a strong value in production) |
   | `GOOGLE_CLIENT_ID` | Google OAuth2 client ID |
   | `GOOGLE_CLIENT_SECRET` | Google OAuth2 client secret |
   | `GOOGLE_REDIRECT_URI` | Callback URL (e.g. `http://localhost:3000/api/auth/google/callback`) |
   | `FRONTEND_URL` | Frontend origin for redirect after login (e.g. `http://localhost:5173`) |
   | `PORT` | API port (default `3000`) |

4. **Run**

   From the repo root:

   ```bash
   npm run dev
   ```

   This starts:

   - **API + WebSocket:** http://localhost:3000  
   - **Web app:** http://localhost:5173  

   Or run separately:

   ```bash
   npm run dev:api   # API on :3000
   npm run dev:web   # Vite on :5173
   ```

5. **Google OAuth**

   - Create a project in [Google Cloud Console](https://console.cloud.google.com/).
   - Enable the Google+ API (or People API).
   - Create OAuth 2.0 credentials (Web application).
   - Add authorized redirect URI: `http://localhost:3000/api/auth/google/callback`.
   - Set `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` in `apps/api/.env`.

## Project structure

```
betterwords/
├── apps/
│   ├── api/          # Express + WebSocket + Yjs persistence
│   └── web/           # React + Vite + Tiptap + Yjs
├── packages/
│   └── shared/        # Shared types (optional)
├── package.json       # Workspaces root
└── README.md
```

## License

See [LICENSE](LICENSE).
