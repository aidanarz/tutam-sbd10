// src/components/ui/SaveModal.jsx
// Modal for saving a progression with a custom title

import { useState, useEffect } from 'react';
import { X, Save, Loader2 } from 'lucide-react';
import { useApp } from '../../context/AppContext.jsx';

export default function SaveModal() {
  const { state, saveProgression, setSaveModal } = useApp();
  const { saveModalOpen, currentKey, currentScale } = state;

  const [title, setTitle] = useState('');
  const [progressionToSave, setProgressionToSave] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const handler = (e) => {
      setProgressionToSave(e.detail);
      // Auto-generate title from progression name
      const progName = e.detail?.name || 'Progression';
      setTitle(`${currentKey} - ${progName}`);
    };
    window.addEventListener('saveProgression', handler);
    return () => window.removeEventListener('saveProgression', handler);
  }, [currentKey]);

  const handleSave = async () => {
    if (!title.trim()) {
      setError('Please enter a title');
      return;
    }
    if (!progressionToSave) return;

    setSaving(true);
    setError('');

    try {
      // Build chord names array from progression chords
      const chordNames = progressionToSave.chords?.map(c => c.symbol) || [];
      
      await saveProgression({
        title: title.trim(),
        key: progressionToSave.key || currentKey,
        scale: progressionToSave.scale || currentScale,
        progression: progressionToSave.chords || [],
        chordNames: chordNames,
        tempo: 120,
      });
      setSaveModal(false);
      setTitle('');
      setProgressionToSave(null);
    } catch (err) {
      setError(err.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    setSaveModal(false);
    setError('');
  };

  if (!saveModalOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}
      onClick={handleClose}
    >
      <div
        className="card w-full max-w-md p-6 animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-display font-bold text-lg text-white">Save Progression</h2>
          <button onClick={handleClose} className="text-gray-500 hover:text-white transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Preview */}
        {progressionToSave && (
          <div className="mb-5 p-3 rounded-xl bg-white/3 border border-white/8">
            <p className="text-xs text-gray-500 mb-2 font-mono">{progressionToSave.name}</p>
            <div className="flex gap-2 flex-wrap">
              {progressionToSave.chords?.map((chord, i) => (
                <span key={i} className="px-2 py-1 rounded-lg text-xs font-mono font-semibold
                                        bg-violet-500/15 border border-violet-500/25 text-violet-200">
                  {chord.symbol}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Title input */}
        <div className="space-y-2 mb-4">
          <label className="label">Progression Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => { setTitle(e.target.value); setError(''); }}
            onKeyDown={(e) => e.key === 'Enter' && handleSave()}
            placeholder="My cool progression..."
            maxLength={100}
            autoFocus
            className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white 
                       placeholder-gray-600 focus:outline-none focus:border-violet-500/60 
                       transition-colors text-sm font-body"
          />
          {error && <p className="text-xs text-rose-400">{error}</p>}
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button onClick={handleClose} className="btn-ghost flex-1 justify-center">
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !title.trim()}
            className="btn-primary flex-1 justify-center"
          >
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}
