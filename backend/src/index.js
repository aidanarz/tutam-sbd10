// src/index.js - Chord Generator Express Server
import express from 'express';
import cors from 'cors';
import routes from './routes/index.js';
import { initDb, dbMode } from './config/db.js';

await initDb();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000', 'http://127.0.0.1:5173'],
  methods: ['GET', 'POST', 'DELETE', 'PUT'],
  allowedHeaders: ['Content-Type'],
}));
app.use(express.json({ limit: '1mb' }));
app.use((req, _res, next) => { console.log(`${req.method} ${req.path}`); next(); });
app.use('/api', routes);
app.use((_req, res) => res.status(404).json({ success: false, error: 'Route not found' }));
app.use((err, _req, res, _next) => {
  console.error('Error:', err);
  res.status(500).json({ success: false, error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`\n🎵 Chord Generator API → http://localhost:${PORT}`);
  console.log(`📋 Health check → http://localhost:${PORT}/api/health\n`);
  console.log(`💾 DB mode: ${dbMode}\n`);
});
