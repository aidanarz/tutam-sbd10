// src/components/progression/ProgressionCards.jsx
// Shows generated chord progression suggestions as interactive cards

import { Play, Save, Loader2 } from 'lucide-react';
import { useApp } from '../../context/AppContext.jsx';
import { playProgression, stopAll } from '../../services/audioService.js';

const MOOD_COLORS = {
  'Uplifting & Anthemic': 'text-amber-300',
  'Jazz & Sophisticated': 'text-blue-300',
  'Blues & Rock': 'text-rose-300',
  'Emotional & Ballad': 'text-violet-300',
  'Nostalgic & Pop': 'text-emerald-300',
  'Epic & Cinematic': 'text-orange-300',
};

export default function ProgressionCards() {
  const { state, setActiveProgression, setPlaying, setPlayingChord, setHighlightedNotes, setSaveModal } = useApp();
  const { progressions, progressionsLoading, activeProgressionId, isPlaying, playingChordIndex, currentKey, currentScale } = state;
  const safeProgressions = Array.isArray(progressions) ? progressions : [];

  const handlePlay = async (progression) => {
    if (isPlaying) {
      await stopAll();
      setPlaying(false);
      setActiveProgression(null);
      setHighlightedNotes([]);
      return;
    }

    setActiveProgression(progression.id);
    setPlaying(true);

    const stopFn = await playProgression(
      progression.chords,
      120,
      (index) => {
        setPlayingChord(index);
        // Highlight the notes of the current chord being played
        const currentChordObj = progression.chords[index];
        if (currentChordObj && currentChordObj.notes) {
          setHighlightedNotes(currentChordObj.notes);
        }
      }
    );

    // Auto-stop after progression ends
    const totalTime = progression.chords.length * 2 * (60 / 120) * 1000;
    setTimeout(() => {
      setPlaying(false);
      setActiveProgression(null);
      setPlayingChord(null);
      setHighlightedNotes([]);
    }, totalTime + 200);
  };

  const handleSave = (progression) => {
    // Store selected progression in context for save modal
    setSaveModal(true);
    // Pass progression data via custom event
    window.dispatchEvent(new CustomEvent('saveProgression', { detail: progression }));
  };

  if (progressionsLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center space-y-3">
          <Loader2 size={24} className="text-violet-500 animate-spin mx-auto" />
          <p className="text-sm text-gray-500">Generating progressions...</p>
        </div>
      </div>
    );
  }

  if (safeProgressions.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-[var(--text-muted)] text-sm">Select a root note to generate progressions</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Key/scale header */}
      <div className="flex items-center gap-2 mb-4">
        <span className="chord-badge">Key of {currentKey}</span>
        <span className="text-xs text-[var(--text-muted)] capitalize">{currentScale} scale</span>
      </div>

      {safeProgressions.map((prog) => {
        const isActive = activeProgressionId === prog.id;
        const moodColor = MOOD_COLORS[prog.mood] || 'text-gray-400';

        return (
          <div
            key={prog.id}
            className={`card p-4 transition-all duration-300 ${
              isActive ? 'border-[var(--secondary)]/50 bg-[var(--secondary)]/5' : 'card-hover'
            }`}
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-display font-semibold text-sm text-white">{prog.name}</h3>
                <p className={`text-xs mt-0.5 ${moodColor}`}>{prog.mood}</p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => handlePlay(prog)}
                  className={`btn-ghost text-sm py-2.5 px-5 rounded-2xl ${isActive && isPlaying ? 'border-violet-500/50 text-violet-300' : ''}`}
                >
                  <Play size={15} className={isActive && isPlaying ? 'text-violet-400' : ''} />
                  {isActive && isPlaying ? 'Stop' : 'Play'}
                </button>
                <button
                  onClick={() => handleSave(prog)}
                  className="btn-ghost text-sm py-2.5 px-5 rounded-2xl"
                >
                  <Save size={15} />
                  Save
                </button>
              </div>
            </div>

            {/* Chord progression display */}
            <div className="flex gap-2 flex-wrap">
              {prog.chords.map((chord, index) => {
                const isPlayingThis = isActive && isPlaying && playingChordIndex === index;
                return (
                  <div
                    key={index}
                    className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl border transition-all duration-300 ${
                      isPlayingThis
                        ? 'bg-violet-500/20 border-violet-400/60 scale-105 shadow-[0_0_12px_rgba(139,92,246,0.4)]'
                        : 'bg-white/3 border-white/8'
                    }`}
                  >
                    {/* Roman numeral */}
                    {prog.romanNumerals && prog.romanNumerals[index] && (
                      <span className="text-[10px] text-gray-500 font-mono">
                        {prog.romanNumerals[index]}
                      </span>
                    )}
                    {/* Chord symbol */}
                    <span className={`text-sm font-mono font-bold ${
                      isPlayingThis ? 'text-violet-200' : 'text-gray-200'
                    }`}>
                      {chord.symbol}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Description */}
            <p className="text-xs text-gray-600 mt-3 italic">{prog.description}</p>
          </div>
        );
      })}
    </div>
  );
}
