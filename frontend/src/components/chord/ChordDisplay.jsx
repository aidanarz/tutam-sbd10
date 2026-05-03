// src/components/chord/ChordDisplay.jsx
// Shows detected chord name, type, and related information

import { Sparkles, Info } from 'lucide-react';
import { useApp } from '../../context/AppContext.jsx';

const CHORD_TYPE_COLORS = {
  Major: 'text-amber-300 bg-amber-400/10 border-amber-400/30',
  Minor: 'text-blue-300 bg-blue-400/10 border-blue-400/30',
  Diminished: 'text-rose-300 bg-rose-400/10 border-rose-400/30',
  Augmented: 'text-emerald-300 bg-emerald-400/10 border-emerald-400/30',
  Dominant: 'text-orange-300 bg-orange-400/10 border-orange-400/30',
  default: 'text-violet-300 bg-violet-400/10 border-violet-400/30',
};

function getTypeColor(type) {
  if (!type) return CHORD_TYPE_COLORS.default;
  const key = Object.keys(CHORD_TYPE_COLORS).find(k => 
    type.toLowerCase().includes(k.toLowerCase())
  );
  return CHORD_TYPE_COLORS[key] || CHORD_TYPE_COLORS.default;
}

export default function ChordDisplay() {
  const { state } = useApp();
  const { detectedChord, selectedNotes, detectionLoading, currentKey, currentScale } = state;

  if (detectionLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="w-6 h-6 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (selectedNotes.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 mx-auto mb-3 rounded-2xl bg-violet-500/5 border border-violet-500/10 
                        flex items-center justify-center">
          <Sparkles size={24} className="text-violet-500/40" />
        </div>
        <p className="text-gray-600 text-sm">Select notes to detect a chord</p>
      </div>
    );
  }

  if (!detectedChord) {
    return (
      <div className="text-center py-6">
        <div className="flex items-center gap-2 justify-center text-gray-500 text-sm">
          <Info size={14} />
          <span>No chord detected — try different note combinations</span>
        </div>
        {currentKey && (
          <div className="mt-3">
            <span className="chord-badge">{currentKey}</span>
          </div>
        )}
      </div>
    );
  }

  const typeColor = getTypeColor(detectedChord.type);

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Main chord name */}
      <div className="text-center">
        <div className="inline-block">
          <h2 className="text-5xl font-display font-bold glow-text" style={{ color: 'var(--accent)' }}>
            {detectedChord.symbol}
          </h2>
        </div>
        {detectedChord.name && detectedChord.name !== detectedChord.symbol && (
          <p className="text-sm text-gray-500 mt-1 font-body">{detectedChord.name}</p>
        )}
      </div>

      {/* Chord details */}
      <div className="flex flex-wrap gap-2 justify-center">
        {detectedChord.type && (
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${typeColor}`}>
            {detectedChord.type}
          </span>
        )}
        {detectedChord.root && (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs border 
                           bg-white/5 border-white/10 text-gray-400">
            Root: <span className="text-white font-mono ml-1">{detectedChord.root}</span>
          </span>
        )}
      </div>

      {/* Chord notes */}
      {detectedChord.notes && detectedChord.notes.length > 0 && (
        <div className="flex gap-1.5 justify-center flex-wrap">
          {detectedChord.notes.map((note, i) => (
            <span key={i} className="px-2 py-0.5 rounded-md text-xs font-mono bg-white/5 text-gray-300 border border-white/8">
              {note}
            </span>
          ))}
        </div>
      )}

      {/* Intervals */}
      {detectedChord.intervals && detectedChord.intervals.length > 0 && (
        <div className="text-center">
          <p className="text-[11px] text-gray-600 font-mono">
            {detectedChord.intervals.join(' – ')}
          </p>
        </div>
      )}
    </div>
  );
}
