// src/components/piano/VirtualPiano.jsx
// Interactive virtual piano keyboard for note selection and highlighting

import { useApp } from '../../context/AppContext.jsx';
import { playNote } from '../../services/audioService.js';

// Piano layout: 2 octaves, C to B
const WHITE_KEYS = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
const BLACK_KEYS = ['C#', 'D#', null, 'F#', 'G#', 'A#', null];

// Position of black keys relative to white keys (%)
const BLACK_KEY_POSITIONS = [
  { note: 'C#', left: '10.5%' },
  { note: 'D#', left: '24.5%' },
  { note: 'F#', left: '52.5%' },
  { note: 'G#', left: '66.5%' },
  { note: 'A#', left: '80.5%' },
];

export default function VirtualPiano() {
  const { state, setRootNote } = useApp();
  const { rootNote, highlightedNotes, isPlaying } = state;

  const handleNoteClick = async (note) => {
    // During playback, only allow highlighting (no selection changes)
    if (isPlaying) return;

    // Toggle root note selection
    if (rootNote === note) {
      // Already selected - can deselect by clicking again
      // or just show it's selected
    } else {
      setRootNote(note);
      await playNote(note, 0.4);
    }
  };

  const isRootNote = (note) => rootNote === note;
  const isHighlighted = (note) => highlightedNotes.includes(note);

  return (
    <div className="w-full">
      <div className="relative h-40 w-full select-none overflow-hidden">
        {/* White keys container */}
        <div className="flex h-full gap-0.5 min-w-0">
          {WHITE_KEYS.map((note) => (
            <button
              key={note}
              onClick={() => handleNoteClick(note)}
              className={`piano-key-white flex-1 transition-all duration-200 ${
                isRootNote(note) ? 'active' : ''
              } ${isHighlighted(note) ? 'highlighted' : ''} cursor-pointer`}
              disabled={isPlaying && !isHighlighted(note)}
              title={note}
            >
              <span className={`text-[12px] font-mono font-bold transition-colors ${
                isRootNote(note)
                  ? 'text-[var(--primary-dark)]'
                  : isHighlighted(note)
                    ? 'text-[var(--primary-dark)]'
                    : 'text-gray-500'
              }`}>
                {note}
              </span>
            </button>
          ))}
        </div>

        {/* Black keys overlay */}
        <div className="absolute inset-0 pointer-events-none">
          {BLACK_KEY_POSITIONS.map(({ note, left }) => (
            <button
              key={note}
              onClick={() => handleNoteClick(note)}
              className={`piano-key-black pointer-events-auto transition-all duration-200 ${
                isRootNote(note) ? 'active' : ''
              } ${isHighlighted(note) ? 'highlighted' : ''} cursor-pointer`}
              disabled={isPlaying && !isHighlighted(note)}
              style={{
                position: 'absolute',
                left,
                top: 0,
                width: '12%',
                height: '68%',
              }}
              title={note}
            >
              <span className={`text-[10px] font-mono font-bold transition-colors ${
                isRootNote(note)
                  ? 'text-white'
                  : isHighlighted(note)
                    ? 'text-white'
                    : 'text-gray-500'
              }`}>
                {note}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
