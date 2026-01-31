import 'dotenv/config';
import http from 'http';
import express, {Router} from 'express';
import { router as matchRouter } from './routes/match.js';
import { attachWebSocketServer } from './ws/server.js';

const PORT = Number(process.env.PORT) || 8000;
const HOST = process.env.HOST || '0.0.0.0';

const app = express();
const server = http.createServer(app);

// Middleware
app.use(express.json());

// Routes
const api = Router();
app.use('/api', api);

api.get('/', (req, res) => {
  res.json({ message: 'Welcome to Live Commentary Server' });
});

api.use('/match', matchRouter);

const { broadcastMatchCreated } = attachWebSocketServer(server);
app.locals.broadcastMatchCreated = broadcastMatchCreated;

// Start server
server.listen(PORT, HOST, () => {
  console.log(`Server is running on http://${HOST}:${PORT}`);
  console.log(`WebSocket server is running on ws://${HOST}:${PORT}/ws`);
});
