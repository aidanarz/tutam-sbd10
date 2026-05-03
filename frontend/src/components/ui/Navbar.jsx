// src/components/ui/Navbar.jsx
// Top navigation bar with app title

import { Music4, BookMarked } from 'lucide-react';

export default function Navbar({ savedCount }) {
  return (
    <header className="relative z-10 flex items-center justify-between px-8 py-5 border-b border-[var(--border)]">
      {/* Logo / Title - Art Deco inspired */}
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-lg bg-[var(--secondary)] flex items-center justify-center 
                        shadow-[8px_8px_16px_rgba(0,0,0,0.35),-8px_-8px_16px_rgba(255,255,255,0.03)] transition-all duration-300">
          <Music4 size={18} className="text-[var(--bg-primary)]" />
        </div>
        <div>
          <h1 className="font-display font-bold text-xl text-[var(--text-primary)] leading-none tracking-wide">
            Chord Generator
          </h1>
          <p className="text-[11px] text-[var(--text-muted)] leading-none mt-1 font-light">Aidan Ardhazizi</p>
        </div>
      </div>

      {/* Right: saved count */}
      <div className="flex items-center gap-3 text-sm text-[var(--text-secondary)] px-4 py-2 rounded-lg bg-[var(--bg-card)] border border-[var(--border)] shadow-[inset_2px_2px_4px_rgba(255,255,255,0.03),inset_-2px_-2px_4px_rgba(0,0,0,0.35)]">
        <BookMarked size={14} />
        <span className="font-mono text-xs font-semibold">{savedCount}</span>
      </div>
    </header>
  );
}
