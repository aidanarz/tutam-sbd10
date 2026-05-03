// src/App.jsx
// Main application layout - 3-column responsive layout

import { useEffect } from 'react';
import { useApp } from './context/AppContext.jsx';
import Navbar from './components/ui/Navbar.jsx';
import VirtualPiano from './components/piano/VirtualPiano.jsx';
import ChordVariantSelector from './components/chord/ChordVariantSelector.jsx';
import ScaleSelector from './components/chord/ScaleSelector.jsx';
import ProgressionCards from './components/progression/ProgressionCards.jsx';
import SavedProgressions from './components/saved/SavedProgressions.jsx';
import SaveModal from './components/ui/SaveModal.jsx';
import { X } from 'lucide-react';

export default function App() {
  const {
    state,
    generateProgressions,
    clearError,
  } = useApp();

  const { rootNote, currentChord, currentScale, error, savedProgressions } = state;

  // Auto-generate progressions when root note or scale changes
  useEffect(() => {
    if (rootNote) {
      generateProgressions(currentScale);
    }
  }, [rootNote, currentScale, generateProgressions]);

  return (
    <div className="flex flex-col h-screen overflow-hidden relative">
      {/* Navbar */}
      <Navbar savedCount={savedProgressions.length} />

      {/* Error toast */}
      {error && (
        <div className="relative z-20 mx-4 mt-2 flex items-center justify-between px-4 py-2.5 
                        rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm animate-slide-up">
          <span>{error}</span>
          <button onClick={clearError}>
            <X size={14} />
          </button>
        </div>
      )}

      {/* Main 3-column layout */}
      <div className="flex-1 flex gap-0 overflow-hidden relative z-10">

        {/* ── LEFT PANEL: Piano & Chord Selector ────────── */}
        <div className="w-[390px] flex-shrink-0 flex flex-col border-r border-[var(--border)] left-panel bg-[var(--bg-secondary)]/40 shadow-[inset_-1px_0_0_rgba(255,255,255,0.03),16px_0_30px_rgba(0,0,0,0.25)]">
          <div className="p-6 space-y-6 h-full flex flex-col">
            {/* Piano */}
            <section className="flex-shrink-0 min-h-0">
              <p className="label mb-3">Select Root Note</p>
              <VirtualPiano />
            </section>

            {/* Chord variant selector */}
            <section className="flex-1 min-h-0 pr-2">
              <ChordVariantSelector />
            </section>
          </div>
        </div>

        {/* ── CENTER PANEL: Progressions ───────────────── */}
        <div className="flex-[0.82] flex flex-col overflow-hidden min-w-0">
          {/* Progression suggestions */}
          <div className="flex-1 overflow-y-auto p-4">
            <div className="flex items-center justify-between mb-4">
              <p className="label">Progression Suggestions</p>
              {rootNote && currentChord && (
                <ScaleSelector />
              )}
            </div>
            <ProgressionCards />
          </div>
        </div>

        {/* ── RIGHT PANEL: Saved Progressions ──────────── */}
        <div className="w-[230px] flex-shrink-0 border-l border-[var(--border)] flex flex-col overflow-hidden bg-[var(--bg-secondary)]/20">
          <div className="p-4 border-b border-[var(--border)]">
            <p className="label">Saved Progressions</p>
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            <SavedProgressions />
          </div>
        </div>
      </div>

      {/* Save modal */}
      <SaveModal />
    </div>
  );
}
