// src/components/chord/ChordVariantSelector.jsx
// Displays chord variants and allows selection with play button

import { Music, Play, X, Loader2 } from 'lucide-react';
import { useApp } from '../../context/AppContext.jsx';
import { playChord } from '../../services/audioService.js';

export default function ChordVariantSelector() {
  const { state, selectChordVariant, clearChord, generateProgressions, setHighlightedNotes } = useApp();
  const { rootNote, chordVariants, currentChord, variantsLoading } = state;

  if (!rootNote) {
    return (
      <div className="flex items-center gap-2 py-3 px-4 rounded-xl bg-white/3 border border-white/5">
        <Music size={14} className="text-gray-600" />
        <span className="text-sm text-gray-600 italic">Click a piano key to select root note...</span>
      </div>
    );
  }

  if (variantsLoading) {
    return (
      <div className="flex items-center justify-center py-6">
        <div className="w-4 h-4 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const handleVariantSelect = (variant) => {
    selectChordVariant(variant);
  };

  const handlePlayChord = async () => {
    if (currentChord?.notes) {
      // Highlight piano keys for visual feedback
      setHighlightedNotes(currentChord.notes);
      
      // Play the chord audio
      await playChord(currentChord.notes, 1.5);
      
      // Clear highlights after playback duration (1.5s)
      setTimeout(() => {
        setHighlightedNotes([]);
      }, 1500);
    }
  };

  return (
    <div className="flex flex-col h-full space-y-4 min-h-0">
      {/* Root note header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">Root:</span>
          <span className="chord-badge text-lg">{String(rootNote)}</span>
        </div>
        <button
          onClick={clearChord}
          className="text-gray-500 hover:text-rose-400 transition-colors"
          title="Clear chord"
        >
          <X size={16} />
        </button>
      </div>

      {/* Current chord display */}
      {currentChord && (
        <div className="space-y-3 p-4 rounded-xl bg-[var(--secondary)]/5 border border-[var(--secondary)]/20">
          <div className="text-center">
            <h3 className="text-2xl font-display font-bold glow-text text-[var(--secondary)]">
              {currentChord.symbol}
            </h3>
            {currentChord.name && currentChord.name !== currentChord.symbol && (
              <p className="text-xs text-[var(--text-muted)] mt-1">{currentChord.name}</p>
            )}
          </div>

          {/* Chord notes */}
          <div className="flex gap-1.5 justify-center flex-wrap">
            {currentChord.notes.map((note, i) => (
              <span key={i} className="px-2 py-0.5 rounded-md text-xs font-mono bg-[var(--bg-secondary)]/30 text-[var(--text-secondary)] border border-[var(--border)]">
                {note}
              </span>
            ))}
          </div>

          {/* Play button */}
          <button
            onClick={handlePlayChord}
            className="w-full mt-3 px-3 py-2 rounded-lg bg-[var(--cta)]/20 border border-[var(--cta)]/30 
                       text-[var(--cta)] hover:bg-[var(--cta)]/30 transition-colors font-semibold text-sm 
                       flex items-center justify-center gap-2 cursor-pointer"
          >
            <Play size={14} />
            Play Chord
          </button>
        </div>
      )}

      {/* Chord variant selector */}
      <div className="space-y-2 flex-1 min-h-0 flex flex-col">
        <p className="text-xs text-gray-500 flex-shrink-0">Select a chord variant ({Array.isArray(chordVariants) ? chordVariants.length : 0} available):</p>
        <div className="grid grid-cols-3 gap-2 pb-4">
          {(Array.isArray(chordVariants) ? chordVariants : []).map((variant, idx) => (
            <button
              key={idx}
              onClick={() => handleVariantSelect(variant)}
              className={`px-2 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all ${
                currentChord?.symbol === variant.symbol
                  ? 'bg-violet-500 text-white border border-violet-400'
                  : 'bg-white/5 text-gray-300 border border-white/10 hover:bg-white/10'
              }`}
            >
              {variant.symbol}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
