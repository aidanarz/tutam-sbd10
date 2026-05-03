// src/components/chord/ScaleSelector.jsx
// Allows user to switch between major and minor scale

import { useApp } from '../../context/AppContext.jsx';

export default function ScaleSelector() {
  const { state, setCurrentScale } = useApp();
  const { currentScale } = state;

  return (
    <div className="flex rounded-xl overflow-hidden border border-white/10 w-fit">
      {['major', 'minor'].map((scale) => (
        <button
          key={scale}
          onClick={() => setCurrentScale(scale)}
          className={`px-4 py-1.5 text-xs font-semibold capitalize transition-all ${
            currentScale === scale
              ? 'bg-violet-600 text-white'
              : 'bg-white/3 text-gray-500 hover:text-white'
          }`}
        >
          {scale}
        </button>
      ))}
    </div>
  );
}
