// src/services/api.js
// API client for communicating with the Express backend

import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

// Response interceptor for unified error handling
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message = error.response?.data?.error || error.message || 'Unknown error';
    console.error('API Error:', message);
    return Promise.reject(new Error(message));
  }
);
// ── Chord API ──────────────────────────────────────────────
export const chordApi = {
  /**
   * Detect chord from array of note names (legacy)
   * @param {string[]} notes
   */
  detect: (notes) => api.post('/chord/detect', { notes }),

  /**
   * Get chord variants available for a root note
   * @param {string} note - Root note e.g. 'C', 'F#'
   */
  getVariants: (note) => api.get(`/chord/variants/${note}`),

  /**
   * Get all available chromatic notes
   */
  getNotes: () => api.get('/notes'),
};

// ── Progression API ────────────────────────────────────────
export const progressionApi = {
  /**
   * Generate progressions from a key/scale
   * @param {string} key - Root note
   * @param {string} scale - 'major' | 'minor'
   * @param {string|null} detectedChord - Optional detected chord symbol
   */
  generate: (key, scale = 'major', detectedChord = null) =>
    api.post('/progression/generate', { key, scale, detectedChord }),

  /**
   * Get all saved progressions
   */
  getAll: () => api.get('/progressions'),

  /**
   * Save a progression to database
   * @param {object} data - Progression data
   */
  save: (data) => api.post('/progressions', data),

  /**
   * Delete a progression by ID
   * @param {string} id
   */
  delete: (id) => api.delete(`/progressions/${id}`),
};

export default api;
