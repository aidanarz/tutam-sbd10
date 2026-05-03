// src/controllers/chordController.js
import { detectChord, getAllNotes, generateChordVariants } from '../services/musicTheoryService.js';
import { getNotes } from '../config/db.js';

export async function detectChordHandler(req, res) {
  try {
    const { notes } = req.body;
    if (!notes || !Array.isArray(notes)) {
      return res.status(400).json({ success: false, error: 'Notes must be an array' });
    }
    if (notes.length === 0) {
      return res.status(400).json({ success: false, error: 'At least one note is required' });
    }
    const validNotes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const invalid = notes.filter(n => !validNotes.includes(n));
    if (invalid.length > 0) {
      return res.status(400).json({ success: false, error: `Invalid notes: ${invalid.join(', ')}` });
    }
    const result = detectChord(notes);
    res.json({ success: true, data: { inputNotes: notes, ...result } });
  } catch (error) {
    console.error('Chord detection error:', error);
    res.status(500).json({ success: false, error: 'Failed to detect chord' });
  }
}

export async function getVariantsHandler(req, res) {
  try {
    const { note } = req.params;
    if (!note) {
      return res.status(400).json({ success: false, error: 'Note parameter is required' });
    }

    const validNotes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    if (!validNotes.includes(note)) {
      return res.status(400).json({ success: false, error: `Invalid note: ${note}` });
    }

    const variants = generateChordVariants(note);
    res.json({ success: true, data: { rootNote: note, variants, count: variants.length } });
  } catch (error) {
    console.error('Variant generation error:', error);
    res.status(500).json({ success: false, error: 'Failed to generate chord variants' });
  }
}

export async function getNotesHandler(req, res) {
  try {
    const data = await getNotes();
    res.json({ success: true, data });
  } catch (error) {
    res.json({ success: true, data: getAllNotes() });
  }
}
