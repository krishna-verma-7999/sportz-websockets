import 'dotenv/config';
import express, {Router} from 'express';
import { router as matchRouter } from './routes/match.js';

const app = express();
const PORT = process.env.PORT || 8000;

// Middleware
app.use(express.json());

// Routes
const api = Router();
app.use('/api', api);

api.get('/', (req, res) => {
  res.json({ message: 'Welcome to Live Commentary Server' });
});

api.use('/match', matchRouter);

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
