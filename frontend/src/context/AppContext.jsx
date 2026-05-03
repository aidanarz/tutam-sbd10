// src/context/AppContext.jsx
// Global state management for the Chord Generator App

import { createContext, useContext, useReducer, useCallback } from 'react';
import { chordApi, progressionApi } from '../services/api.js';

const AppContext = createContext(null);

function normalizeNoteValue(note) {
  if (typeof note === 'string') return note;
  if (note && typeof note === 'object') {
    return note.symbol || note.name || note.root || note.note || String(note);
  }
  return '';
}

function normalizeArray(value) {
  return Array.isArray(value) ? value : [];
}

// ── State shape ──────────────────────────────────────────
const initialState = {
  // Chord generation (new flow)
  rootNote: null,                 // Single selected root note
  selectedNotes: [],              // Backward-compatible legacy field
  chordVariants: [],              // All chord variants for root note
  currentChord: null,             // Selected chord variant (full object)
  detectedChord: null,            // Backward-compatible legacy field
  variantsLoading: false,
  detectionLoading: false,

  // Progressions
  currentKey: null,
  currentScale: 'major',
  progressions: [],
  progressionsLoading: false,
  activeProgressionId: null,

  // Saved progressions
  savedProgressions: [],
  savedLoading: false,

  // Audio & Playback
  isPlaying: false,
  playingChordIndex: null,
  highlightedNotes: [],           // Piano keys to highlight during playback

  // UI
  error: null,
  saveModalOpen: false,
};

// ── Reducer ──────────────────────────────────────────────
function reducer(state, action) {
  switch (action.type) {
    case 'SET_ROOT_NOTE':
      return {
        ...state,
        rootNote: normalizeNoteValue(action.note),
        selectedNotes: normalizeNoteValue(action.note) ? [normalizeNoteValue(action.note)] : [],
        currentChord: null,
        detectedChord: null,
        highlightedNotes: [],
        progressions: [],
      };
    case 'CLEAR_ROOT_NOTE':
      return {
        ...state,
        rootNote: null,
        selectedNotes: [],
        currentChord: null,
        detectedChord: null,
        chordVariants: [],
        progressions: [],
        highlightedNotes: [],
      };
    case 'SET_CHORD_VARIANTS':
      return { ...state, chordVariants: normalizeArray(action.variants), variantsLoading: false };
    case 'SET_VARIANTS_LOADING':
      return { ...state, variantsLoading: action.loading };
    case 'SET_CURRENT_CHORD':
      return {
        ...state,
        currentChord: action.chord || null,
        detectedChord: action.chord || null,
        selectedNotes: normalizeArray(action.chord?.notes),
        highlightedNotes: normalizeArray(action.chord?.notes),
      };
    case 'SET_PROGRESSIONS':
      return {
        ...state,
        progressions: normalizeArray(action.progressions),
        currentKey: action.key,
        currentScale: action.scale,
        progressionsLoading: false,
      };
    case 'SET_PROGRESSIONS_LOADING':
      return { ...state, progressionsLoading: action.loading };
    case 'SET_ACTIVE_PROGRESSION':
      return { ...state, activeProgressionId: action.id };
    case 'SET_SAVED_PROGRESSIONS':
      return { ...state, savedProgressions: normalizeArray(action.progressions), savedLoading: false };
    case 'SET_SAVED_LOADING':
      return { ...state, savedLoading: action.loading };
    case 'ADD_SAVED_PROGRESSION':
      return { ...state, savedProgressions: [action.progression, ...state.savedProgressions] };
    case 'REMOVE_SAVED_PROGRESSION':
      return { ...state, savedProgressions: state.savedProgressions.filter(p => p.id !== action.id) };
    case 'SET_PLAYING':
      return { ...state, isPlaying: action.playing, playingChordIndex: action.playing ? state.playingChordIndex : null };
    case 'SET_PLAYING_CHORD':
      return { ...state, playingChordIndex: action.index };
    case 'SET_HIGHLIGHTED_NOTES':
      return { ...state, highlightedNotes: normalizeArray(action.notes) };
    case 'SET_CURRENT_SCALE':
      return { ...state, currentScale: action.scale };
    case 'SET_ERROR':
      return { ...state, error: action.error };
    case 'SET_SAVE_MODAL':
      return { ...state, saveModalOpen: action.open };
    default:
      return state;
  }
}

// ── Provider ──────────────────────────────────────────────
export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  // Set root note and fetch available chord variants
  const setRootNote = useCallback(async (note) => {
    const normalizedNote = normalizeNoteValue(note);
    dispatch({ type: 'SET_ROOT_NOTE', note: normalizedNote });
    dispatch({ type: 'SET_VARIANTS_LOADING', loading: true });
    try {
      const result = await chordApi.getVariants(normalizedNote);
      dispatch({ type: 'SET_CHORD_VARIANTS', variants: result?.data?.variants || [] });
    } catch (err) {
      dispatch({ type: 'SET_ERROR', error: err.message });
      dispatch({ type: 'SET_VARIANTS_LOADING', loading: false });
    }
  }, []);

  // Clear root note and chord
  const clearChord = useCallback(() => {
    dispatch({ type: 'CLEAR_ROOT_NOTE' });
  }, []);

  // Select a chord variant and generate chord notes
  const selectChordVariant = useCallback((variant) => {
    dispatch({ type: 'SET_CURRENT_CHORD', chord: variant });
  }, []);

  // Generate progressions from root note (default: first major chord variant)
  const generateProgressions = useCallback(async (scale = 'major', rootOverride = null) => {
    const rootToUse = normalizeNoteValue(rootOverride || state.currentChord?.root || state.rootNote);
    if (!rootToUse) return;
    dispatch({ type: 'SET_PROGRESSIONS_LOADING', loading: true });
    try {
      const result = await progressionApi.generate(rootToUse, scale);
      dispatch({
        type: 'SET_PROGRESSIONS',
        progressions: result?.data?.progressions || [],
        key: result?.data?.key || rootToUse,
        scale: result?.data?.scale || scale,
      });
    } catch (err) {
      dispatch({ type: 'SET_ERROR', error: err.message });
      dispatch({ type: 'SET_PROGRESSIONS_LOADING', loading: false });
    }
  }, [state.rootNote, state.currentChord]);

  // Load saved progressions from database
  const loadSavedProgressions = useCallback(async () => {
    dispatch({ type: 'SET_SAVED_LOADING', loading: true });
    try {
      const result = await progressionApi.getAll();
      dispatch({ type: 'SET_SAVED_PROGRESSIONS', progressions: result?.data || [] });
    } catch (err) {
      dispatch({ type: 'SET_ERROR', error: err.message });
      dispatch({ type: 'SET_SAVED_LOADING', loading: false });
    }
  }, []);

  // Save a progression
  const saveProgression = useCallback(async (data) => {
    try {
      const result = await progressionApi.save(data);
      dispatch({ type: 'ADD_SAVED_PROGRESSION', progression: result.data });
      return result.data;
    } catch (err) {
      dispatch({ type: 'SET_ERROR', error: err.message });
      throw err;
    }
  }, []);

  // Delete a progression
  const deleteProgression = useCallback(async (id) => {
    try {
      await progressionApi.delete(id);
      dispatch({ type: 'REMOVE_SAVED_PROGRESSION', id });
    } catch (err) {
      dispatch({ type: 'SET_ERROR', error: err.message });
    }
  }, []);

  const setActiveProgression = useCallback((id) => {
    dispatch({ type: 'SET_ACTIVE_PROGRESSION', id });
  }, []);

  const setPlaying = useCallback((playing) => {
    dispatch({ type: 'SET_PLAYING', playing });
  }, []);

  const setPlayingChord = useCallback((index) => {
    dispatch({ type: 'SET_PLAYING_CHORD', index });
  }, []);

  const setHighlightedNotes = useCallback((notes) => {
    dispatch({ type: 'SET_HIGHLIGHTED_NOTES', notes });
  }, []);

  const setCurrentScale = useCallback((scale) => {
    dispatch({ type: 'SET_CURRENT_SCALE', scale });
  }, []);

  const clearError = useCallback(() => {
    dispatch({ type: 'SET_ERROR', error: null });
  }, []);

  const setSaveModal = useCallback((open) => {
    dispatch({ type: 'SET_SAVE_MODAL', open });
  }, []);

  const value = {
    state,
    setRootNote,
    clearChord,
    selectChordVariant,
    generateProgressions,
    loadSavedProgressions,
    saveProgression,
    deleteProgression,
    setActiveProgression,
    setPlaying,
    setPlayingChord,
    setHighlightedNotes,
    setCurrentScale,
    clearError,
    setSaveModal,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
