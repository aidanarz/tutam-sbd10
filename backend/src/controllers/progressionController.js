// src/controllers/progressionController.js
import { v4 as uuidv4 } from 'uuid';
import { generateProgressions } from '../services/musicTheoryService.js';
import { getProgressions, saveProgression, deleteProgressionById } from '../config/db.js';

export async function generateProgressionHandler(req, res) {
  try {
    const { key, scale = 'major', detectedChord } = req.body;
    if (!key) return res.status(400).json({ success: false, error: 'Key note is required' });
    const validNotes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    if (!validNotes.includes(key)) return res.status(400).json({ success: false, error: `Invalid key: ${key}` });
    if (!['major', 'minor'].includes(scale)) return res.status(400).json({ success: false, error: 'Scale must be major or minor' });
    const progressions = generateProgressions(key, scale);
    res.json({ success: true, data: { key, scale, detectedChord: detectedChord || null, progressions } });
  } catch (error) {
    console.error('Generate error:', error);
    res.status(500).json({ success: false, error: 'Failed to generate progressions' });
  }
}

export async function getProgressionsHandler(req, res) {
  try {
    const data = await getProgressions();
    const sorted = [...data].sort(
      (a, b) => new Date(b.created_at) - new Date(a.created_at)
    );
    res.json({ success: true, data: sorted });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch progressions' });
  }
}

export async function saveProgressionHandler(req, res) {
  try {
    const { title, key, scale, progression, chordNames, tempo } = req.body;
    if (!title || !key || !progression) {
      return res.status(400).json({ success: false, error: 'Title, key, and progression are required' });
    }
    if (title.trim().length < 1 || title.trim().length > 100) {
      return res.status(400).json({ success: false, error: 'Title must be 1-100 characters' });
    }
    
    // New format: save chord names array instead of notes
    const progressionData = Array.isArray(progression) 
      ? progression.map(chord => typeof chord === 'object' ? chord.symbol : chord)
      : [];
    
    const newProg = {
      id: uuidv4(),
      title: title.trim(),
      key_note: key,
      scale: scale || 'major',
      progression: progressionData, // ["Cmaj7", "Am7", "Fmaj7", "G7"]
      chord_names: chordNames || progressionData, // Optional alias for clarity
      tempo: tempo || 120,
      created_at: new Date().toISOString(),
    };
    await saveProgression(newProg);
    res.status(201).json({ success: true, data: newProg, message: 'Progression saved successfully' });
  } catch (error) {
    console.error('Save error:', error);
    res.status(500).json({ success: false, error: 'Failed to save progression' });
  }
}

export async function deleteProgressionHandler(req, res) {
  try {
    const { id } = req.params;
    const deleted = await deleteProgressionById(id);
    if (!deleted) return res.status(404).json({ success: false, error: 'Progression not found' });
    res.json({ success: true, message: 'Deleted', data: { id } });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to delete progression' });
  }
}
