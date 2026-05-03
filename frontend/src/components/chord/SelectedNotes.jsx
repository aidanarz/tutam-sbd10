// src/components/chord/SelectedNotes.jsx
// Displays currently selected notes with remove buttons

import { X, Music } from 'lucide-react';
import { useApp } from '../../context/AppContext.jsx';

export default function SelectedNotes() {
  const { state, removeNote, clearNotes } = useApp();
  const { selectedNotes } = state;

  if (selectedNotes.length === 0) {
    return (
      <div className="flex items-center gap-2 py-3 px-4 rounded-xl bg-white/3 border border-white/5">
        <Music size={14} className="text-gray-600" />
        <span className="text-sm text-gray-600 italic">Click keys to select notes...</span>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {selectedNotes.map((note) => (
          <span
            key={note}
            className="note-tag animate-bounce-soft group cursor-pointer"
            onClick={() => removeNote(note)}
            title={`Remove ${note}`}
          >
            {note}
            <X size={12} className="text-violet-500 group-hover:text-rose-400 transition-colors" />
          </span>
        ))}
      </div>

      {selectedNotes.length > 1 && (
        <button
          onClick={clearNotes}
          className="text-xs text-gray-500 hover:text-rose-400 transition-colors flex items-center gap-1 mt-1"
        >
          <X size={11} />
          Clear all
        </button>
      )}
    </div>
  );
}
