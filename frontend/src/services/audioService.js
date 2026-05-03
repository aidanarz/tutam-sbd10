// src/services/audioService.js
// Audio playback engine using Tone.js
// Provides synth piano-like sounds for chords and progressions

let Tone = null;
let synth = null;
let isInitialized = false;

/**
 * Lazy-load Tone.js and initialize synth
 * Must be called after user interaction (browser autoplay policy)
 */
async function initAudio() {
  if (isInitialized) return;

  try {
    Tone = await import('tone');
    await Tone.start(); // Required by browser autoplay policy

    // Create a polyphonic synth with piano-like envelope
    synth = new Tone.PolySynth(Tone.Synth, {
      oscillator: {
        type: 'triangle',
      },
      envelope: {
        attack: 0.02,
        decay: 0.3,
        sustain: 0.4,
        release: 1.2,
      },
      volume: -8,
    }).toDestination();

    // Add subtle reverb for warmth
    const reverb = new Tone.Reverb({ decay: 2, wet: 0.2 }).toDestination();
    synth.connect(reverb);

    isInitialized = true;
    console.log('🎵 Audio engine initialized');
  } catch (err) {
    console.error('Failed to initialize audio:', err);
  }
}

/**
 * Map note name to Tone.js frequency notation
 * Adds octave number for playback
 * @param {string} note - Note name like 'C', 'F#'
 * @param {number} octave - Octave number (default 4)
 */
function noteToFreq(note, octave = 4) {
  // Normalize flats to sharps for Tone.js
  const noteMap = {
    'Bb': 'A#', 'Eb': 'D#', 'Ab': 'G#', 'Db': 'C#', 'Gb': 'F#',
  };
  const normalized = noteMap[note] || note;
  return `${normalized}${octave}`;
}

/**
 * Play a single note
 * @param {string} note - Note name
 * @param {number} duration - Duration in seconds
 */
export async function playNote(note, duration = 0.5) {
  await initAudio();
  if (!synth) return;

  try {
    const freq = noteToFreq(note, 4);
    synth.triggerAttackRelease(freq, duration);
  } catch (err) {
    console.error('Play note error:', err);
  }
}

/**
 * Play a chord (multiple notes simultaneously)
 * @param {string[]} notes - Array of note names
 * @param {number} duration - Duration in seconds
 */
export async function playChord(notes, duration = 1.5) {
  await initAudio();
  if (!synth || !notes || notes.length === 0) return;

  try {
    // Spread notes across 2 octaves for fuller sound
    const freqs = notes.map((note, i) => {
      const octave = i < 3 ? 4 : 5;
      return noteToFreq(note, octave);
    });
    synth.triggerAttackRelease(freqs, duration);
  } catch (err) {
    console.error('Play chord error:', err);
  }
}

/**
 * Play a full chord progression with timing
 * @param {object[]} chords - Array of chord objects with .notes property
 * @param {number} tempo - BPM (default 120)
 * @param {function} onChordPlay - Callback with index when each chord plays
 * @returns {function} Stop function to cancel playback
 */
export async function playProgression(chords, tempo = 120, onChordPlay = null) {
  await initAudio();
  if (!synth || !chords || chords.length === 0) return () => {};

  const beatsPerChord = 2; // Each chord lasts 2 beats
  const secPerBeat = 60 / tempo;
  const chordDuration = beatsPerChord * secPerBeat;

  let stopped = false;
  let currentTimeout = null;

  const playNext = async (index) => {
    if (stopped || index >= chords.length) return;

    const chord = chords[index];
    if (chord && chord.notes && chord.notes.length > 0) {
      await playChord(chord.notes, chordDuration * 0.85); // Slight gap between chords
      if (onChordPlay) onChordPlay(index);
    }

    currentTimeout = setTimeout(() => {
      playNext(index + 1);
    }, chordDuration * 1000);
  };

  playNext(0);

  // Return stop function
  return () => {
    stopped = true;
    if (currentTimeout) clearTimeout(currentTimeout);
    try {
      if (synth) synth.releaseAll();
    } catch (e) {}
  };
}

/**
 * Stop all currently playing sounds
 */
export async function stopAll() {
  if (synth) {
    try {
      synth.releaseAll();
    } catch (e) {}
  }
}
