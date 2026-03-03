import { config } from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
config({ path: path.resolve(__dirname, '../.env') });

import http from 'http';
import express from 'express';
import cors from 'cors';
import { registerRoutes } from './routes/index.js';
import { attachWebSocket } from './ws-server.js';
import { db } from './db/client.js';

const app = express();
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '10mb' }));

registerRoutes(app);

const server = http.createServer(app);
attachWebSocket(server);

const PORT = process.env.PORT ?? 3000;
server.listen(PORT, async () => {
  await db.ensureUser('demo-user', 'demo@test.com', 'Demo User', '');
  console.log(`API + WebSocket listening on http://localhost:${PORT}`);
});
