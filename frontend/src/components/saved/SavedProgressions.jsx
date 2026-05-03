// src/components/saved/SavedProgressions.jsx
// Right panel showing saved progressions from database

import { useEffect } from 'react';
import { Trash2, Play, BookMarked, Loader2 } from 'lucide-react';
import { useApp } from '../../context/AppContext.jsx';
import { playProgression, stopAll } from '../../services/audioService.js';
import { Chord } from '@tonaljs/tonal';

// Helper to normalize notes to sharps for the virtual piano
const normalizeNote = (note) => {
  const map = { 'Bb': 'A#', 'Eb': 'D#', 'Ab': 'G#', 'Db': 'C#', 'Gb': 'F#' };
  return map[note] || note;
};

export default function SavedProgressions() {
  const { state, loadSavedProgressions, deleteProgression, setPlaying, setPlayingChord, setActiveProgression, setHighlightedNotes } = useApp();
  const { savedProgressions, savedLoading, isPlaying, activeProgressionId } = state;

  // Load saved progressions on mount
  useEffect(() => {
    loadSavedProgressions();
  }, []);

  const handlePlay = async (progression) => {
    if (isPlaying && activeProgressionId === `saved_${progression.id}`) {
      await stopAll();
      setPlaying(false);
      setActiveProgression(null);
      setHighlightedNotes([]);
      return;
    }

    // Convert chord names or objects to objects with notes
    const chords = Array.isArray(progression.progression)
      ? progression.progression.map(chord => {
          const symbolStr = typeof chord === 'string' ? chord : chord.symbol;
          const parsed = Chord.get(symbolStr);
          const notes = parsed.notes ? parsed.notes.map(normalizeNote) : [];
          return {
            symbol: symbolStr,
            notes: typeof chord !== 'string' && chord.notes && chord.notes.length > 0 
                    ? chord.notes.map(normalizeNote) 
                    : notes
          };
        })
      : [];

    if (chords.length === 0) return;

    setActiveProgression(`saved_${progression.id}`);
    setPlaying(true);

    await playProgression(chords, 120, (index) => {
      setPlayingChord(index);
      // Highlight notes of current chord
      const currentChord = chords[index];
      if (currentChord && currentChord.notes && currentChord.notes.length > 0) {
        setHighlightedNotes(currentChord.notes);
      }
    });

    const totalTime = chords.length * 2 * 0.5 * 1000;
    setTimeout(() => {
      setPlaying(false);
      setActiveProgression(null);
      setHighlightedNotes([]);
    }, totalTime + 300);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this progression?')) {
      await deleteProgression(id);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  if (savedLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 size={18} className="text-violet-500 animate-spin" />
      </div>
    );
  }

  if (savedProgressions.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-white/3 border border-white/8 
                        flex items-center justify-center">
          <BookMarked size={18} className="text-gray-600" />
        </div>
        <p className="text-sm text-gray-600">No saved progressions yet</p>
        <p className="text-xs text-gray-700 mt-1">Generate and save a progression to see it here</p>
      </div>
    );
  }

  return (
    <div className="space-y-2.5 overflow-y-auto max-h-full">
      {savedProgressions.map((prog) => {
        const isActive = activeProgressionId === `saved_${prog.id}`;
        const chords = Array.isArray(prog.progression) ? prog.progression : [];

        return (
          <div
            key={prog.id}
            className={`card p-3 transition-all duration-200 group ${
              isActive ? 'border-violet-500/40 bg-violet-500/5' : 'card-hover'
            }`}
          >
            {/* Title & date */}
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-semibold text-white truncate font-display">{prog.title}</h4>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-[10px] font-mono text-amber-400/80">
                    {prog.key_note} {prog.scale}
                  </span>
                  <span className="text-gray-700 text-[10px]">·</span>
                  <span className="text-[10px] text-gray-600">{formatDate(prog.created_at)}</span>
                </div>
              </div>
            </div>

            {/* Chord chips */}
            <div className="flex gap-1 flex-wrap mb-2.5">
              {chords.slice(0, 6).map((chord, i) => (
                <span key={i} className="px-2 py-0.5 rounded-md text-[10px] font-mono 
                                        bg-white/5 border border-white/8 text-gray-300">
                  {chord.symbol || chord}
                </span>
              ))}
              {chords.length > 6 && (
                <span className="text-[10px] text-gray-600">+{chords.length - 6}</span>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePlay(prog)}
                className={`flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-lg border transition-all ${
                  isActive && isPlaying
                    ? 'border-violet-500/50 text-violet-300 bg-violet-500/10'
                    : 'border-white/10 text-gray-500 hover:text-white hover:border-white/20'
                }`}
              >
                <Play size={10} />
                {isActive && isPlaying ? 'Stop' : 'Play'}
              </button>
              <button
                onClick={() => handleDelete(prog.id)}
                className="btn-danger ml-auto opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Trash2 size={11} />
                Delete
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
