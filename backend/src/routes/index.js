// src/routes/index.js
// Central router - all API routes defined here

import { Router } from 'express';
import { detectChordHandler, getNotesHandler, getVariantsHandler } from '../controllers/chordController.js';
import {
  generateProgressionHandler,
  getProgressionsHandler,
  saveProgressionHandler,
  deleteProgressionHandler,
} from '../controllers/progressionController.js';

const router = Router();

// ── Chord Routes ──────────────────────────────────────────
// POST /api/chord/detect   - Detect chord from notes array
router.post('/chord/detect', detectChordHandler);

// GET /api/chord/variants/:note - Get all chord variants for a root note
router.get('/chord/variants/:note', getVariantsHandler);

// GET /api/notes           - Get all chromatic notes
router.get('/notes', getNotesHandler);

// ── Progression Routes ───────────────────────────────────
// POST /api/progression/generate - Generate progressions from key
router.post('/progression/generate', generateProgressionHandler);

// GET /api/progressions          - List all saved progressions
router.get('/progressions', getProgressionsHandler);

// POST /api/progressions         - Save a new progression
router.post('/progressions', saveProgressionHandler);

// DELETE /api/progressions/:id   - Delete a progression by ID
router.delete('/progressions/:id', deleteProgressionHandler);

// Health check
router.get('/health', (req, res) => {
  res.json({ success: true, message: 'Chord Generator API is running 🎵', timestamp: new Date().toISOString() });
});

export default router;
