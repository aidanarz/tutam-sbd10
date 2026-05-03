// src/components/audio/AudioControls.jsx
// Bottom bar with playback controls for chord and progression

import { Play, Square, Volume2, Music2 } from 'lucide-react';
import { useApp } from '../../context/AppContext.jsx';
import { playChord, stopAll } from '../../services/audioService.js';

export default function AudioControls() {
  const { state, setPlaying } = useApp();
  const { selectedNotes, detectedChord, isPlaying } = state;

  const handlePlayChord = async () => {
    if (isPlaying) {
      await stopAll();
      setPlaying(false);
      return;
    }

    const notesToPlay = detectedChord?.notes || selectedNotes;
    if (notesToPlay.length === 0) return;

    setPlaying(true);
    await playChord(notesToPlay, 2);
    setTimeout(() => setPlaying(false), 2200);
  };

  const hasNotes = selectedNotes.length > 0;

  return (
    <div className="flex items-center gap-4 px-6 py-3 border-t border-white/5">
      {/* Chord playback */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5 text-gray-500">
          <Volume2 size={14} />
          <span className="text-xs font-mono">Audio</span>
        </div>

        <button
          onClick={handlePlayChord}
          disabled={!hasNotes}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold 
                      transition-all duration-200 border active:scale-95
                      disabled:opacity-30 disabled:cursor-not-allowed ${
            isPlaying
              ? 'bg-rose-500/15 border-rose-500/40 text-rose-300 playing'
              : 'bg-violet-600/15 border-violet-500/30 text-violet-300 hover:bg-violet-600/25'
          }`}
        >
          {isPlaying ? (
            <>
              <Square size={13} fill="currentColor" />
              Stop
            </>
          ) : (
            <>
              <Play size={13} fill="currentColor" />
              Play Chord
            </>
          )}
        </button>
      </div>

      {/* Status indicator */}
      {hasNotes && (
        <div className="flex items-center gap-2 ml-2">
          <div className={`w-1.5 h-1.5 rounded-full ${isPlaying ? 'bg-violet-400 animate-pulse' : 'bg-gray-700'}`} />
          <span className="text-xs text-gray-600 font-mono">
            {isPlaying ? 'Playing...' : `${selectedNotes.join(', ')}`}
          </span>
        </div>
      )}

      {/* Detected chord pill */}
      {state.detectedChord && (
        <div className="ml-auto flex items-center gap-2">
          <Music2 size={13} className="text-gray-600" />
          <span className="chord-badge text-xs">{state.detectedChord.symbol}</span>
        </div>
      )}
    </div>
  );
}
