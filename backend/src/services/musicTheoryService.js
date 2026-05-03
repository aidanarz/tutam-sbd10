// src/services/musicTheoryService.js
// Core music theory engine - chord detection & progression generation
// Uses @tonaljs/tonal for music theory calculations

import { Chord, Note, Scale, Key, ChordType } from '@tonaljs/tonal';

/**
 * Detect chord(s) from an array of note names
 * @param {string[]} notes - Array of note names e.g. ['C', 'E', 'G']
 * @returns {object} Detection result with chord name, type, key info
 */
export function detectChord(notes) {
  if (!notes || notes.length === 0) {
    return { detected: null, suggestions: [], key: null };
  }

  if (notes.length === 1) {
    return {
      detected: { symbol: notes[0], name: `${notes[0]} (single note)`, type: 'note', root: notes[0] },
      suggestions: [],
      key: notes[0],
    };
  }

  // Use Tonal.js to detect chord from notes
  const detected = Chord.detect(notes);
  const primaryChord = detected[0] || null;

  let chordInfo = null;
  let keyNote = notes[0];

  if (primaryChord) {
    const chord = Chord.get(primaryChord);
    chordInfo = {
      symbol: primaryChord,
      name: chord.name || primaryChord,
      type: chord.quality || chord.type || 'unknown',
      root: chord.tonic || notes[0],
      intervals: chord.intervals || [],
      notes: chord.notes || notes,
    };
    keyNote = chord.tonic || notes[0];
  }

  return {
    detected: chordInfo,
    suggestions: detected.slice(0, 5),
    key: keyNote,
  };
}

/**
 * Generate all chord variants available for a root note
 * @param {string} rootNote - Root note e.g. 'C', 'F#'
 * @returns {object[]} Array of chord objects with symbol, name, notes, intervals
 */
export function generateChordVariants(rootNote) {
  if (!rootNote) return [];

  // Get all available chord types from Tonal.js
  const chordTypes = ChordType.all();
  
  const variants = chordTypes
    .map((typeObj) => {
      try {
        const alias = typeObj.aliases && typeObj.aliases.length > 0 ? typeObj.aliases[0] : '';
        const symbol = `${rootNote}${alias}`;
        const chord = Chord.get(symbol);
        
        if (!chord || !chord.notes || chord.notes.length === 0) {
          return null;
        }

        return {
          symbol: symbol,
          name: chord.name || symbol,
          type: typeObj.name || alias,
          intervals: chord.intervals || [],
          notes: chord.notes,
          root: rootNote,
        };
      } catch (err) {
        return null;
      }
    })
    .filter(v => v !== null)
    .sort((a, b) => {
      // Sort by commonality: maj, m, 7, m7, maj7, others
      const order = ['', 'm', '7', 'm7', 'maj7', 'dim', 'aug', 'sus2', 'sus4'];
      const aIndex = order.findIndex(o => a.symbol.endsWith(o));
      const bIndex = order.findIndex(o => b.symbol.endsWith(o));
      return (aIndex === -1 ? 999 : aIndex) - (bIndex === -1 ? 999 : bIndex);
    });

  return variants;
}

/**
 * Generate chord progressions based on a key/root note
 * @param {string} keyNote - Root note e.g. 'C', 'G', 'F#'
 * @param {string} scale - Scale type: 'major' | 'minor'
 * @returns {object[]} Array of progression objects
 */
export function generateProgressions(keyNote, scale = 'major') {
  // Get scale notes using Tonal.js
  const scaleData = Scale.get(`${keyNote} ${scale}`);
  const scaleNotes = scaleData.notes;

  if (!scaleNotes || scaleNotes.length === 0) {
    return getFallbackProgressions(keyNote, scale);
  }

  // Define common progression patterns (using scale degree indices 0-6)
  const progressionTemplates = [
    {
      name: 'I – V – vi – IV',
      pattern: scale === 'major' ? [0, 4, 5, 3] : [0, 4, 6, 3],
      description: 'The most popular progression in modern music',
      romanNumerals: scale === 'major' ? ['I', 'V', 'vi', 'IV'] : ['i', 'v', 'VII', 'VI'],
      mood: 'Uplifting & Anthemic',
    },
    {
      name: 'ii – V – I',
      pattern: scale === 'major' ? [1, 4, 0] : [1, 4, 0],
      description: 'Classic jazz progression, creates strong resolution',
      romanNumerals: scale === 'major' ? ['ii', 'V', 'I'] : ['iidim', 'v', 'i'],
      mood: 'Jazz & Sophisticated',
    },
    {
      name: 'I – IV – V – I',
      pattern: [0, 3, 4, 0],
      description: 'Blues and rock foundation, timeless and powerful',
      romanNumerals: scale === 'major' ? ['I', 'IV', 'V', 'I'] : ['i', 'IV', 'v', 'i'],
      mood: 'Blues & Rock',
    },
    {
      name: 'vi – IV – I – V',
      pattern: scale === 'major' ? [5, 3, 0, 4] : [0, 6, 3, 4],
      description: 'Emotional and introspective, great for ballads',
      romanNumerals: scale === 'major' ? ['vi', 'IV', 'I', 'V'] : ['i', 'VII', 'iv', 'v'],
      mood: 'Emotional & Ballad',
    },
    {
      name: 'I – vi – IV – V',
      pattern: scale === 'major' ? [0, 5, 3, 4] : [0, 5, 3, 4],
      description: '50s progression, nostalgic and feel-good',
      romanNumerals: scale === 'major' ? ['I', 'vi', 'IV', 'V'] : ['i', 'VI', 'iv', 'v'],
      mood: 'Nostalgic & Pop',
    },
    {
      name: 'I – V – vi – iii – IV',
      pattern: scale === 'major' ? [0, 4, 5, 2, 3] : [0, 4, 5, 2, 3],
      description: 'Canon progression, epic and grandiose',
      romanNumerals: scale === 'major' ? ['I', 'V', 'vi', 'iii', 'IV'] : ['i', 'v', 'VI', 'III', 'iv'],
      mood: 'Epic & Cinematic',
    },
  ];

  // Build chords for each scale degree
  const scaleDegreeChords = buildScaleDegreeChords(scaleNotes, scale);

  return progressionTemplates.map((template, index) => {
    const chords = template.pattern.map((degree) => {
      const chord = scaleDegreeChords[degree] || { symbol: scaleNotes[degree], notes: [scaleNotes[degree]] };
      return chord;
    });

    return {
      id: `prog_${index}`,
      name: template.name,
      description: template.description,
      romanNumerals: template.romanNumerals,
      mood: template.mood,
      chords: chords,
      key: keyNote,
      scale: scale,
    };
  });
}

/**
 * Build chord objects for each scale degree
 */
function buildScaleDegreeChords(scaleNotes, scale) {
  const qualities = scale === 'major'
    ? ['M', 'm', 'm', 'M', 'M', 'm', 'dim']  // Major scale qualities
    : ['m', 'dim', 'M', 'm', 'm', 'M', 'M']; // Natural minor scale qualities

  return scaleNotes.slice(0, 7).map((note, index) => {
    const quality = qualities[index] || 'M';
    let symbol, chordNotes;

    if (quality === 'M') {
      symbol = note;
      chordNotes = getMajorChordNotes(note);
    } else if (quality === 'm') {
      symbol = `${note}m`;
      chordNotes = getMinorChordNotes(note);
    } else {
      symbol = `${note}dim`;
      chordNotes = getDimChordNotes(note);
    }

    return { symbol, notes: chordNotes, quality, root: note };
  });
}

function getMajorChordNotes(root) {
  const chord = Chord.get(`${root}M`);
  return chord.notes.length > 0 ? chord.notes : [root];
}

function getMinorChordNotes(root) {
  const chord = Chord.get(`${root}m`);
  return chord.notes.length > 0 ? chord.notes : [root];
}

function getDimChordNotes(root) {
  const chord = Chord.get(`${root}dim`);
  return chord.notes.length > 0 ? chord.notes : [root];
}

/**
 * Fallback progressions when scale detection fails
 */
function getFallbackProgressions(keyNote, scale) {
  return [
    {
      id: 'prog_0',
      name: 'I – V – vi – IV',
      description: 'Most popular pop progression',
      romanNumerals: ['I', 'V', 'vi', 'IV'],
      mood: 'Uplifting',
      chords: [
        { symbol: keyNote, notes: [keyNote], quality: 'M', root: keyNote },
      ],
      key: keyNote,
      scale,
    },
  ];
}

/**
 * Get all available notes in chromatic scale
 */
export function getAllNotes() {
  return [
    { name: 'C', semitone: 0 },
    { name: 'C#', semitone: 1 },
    { name: 'D', semitone: 2 },
    { name: 'D#', semitone: 3 },
    { name: 'E', semitone: 4 },
    { name: 'F', semitone: 5 },
    { name: 'F#', semitone: 6 },
    { name: 'G', semitone: 7 },
    { name: 'G#', semitone: 8 },
    { name: 'A', semitone: 9 },
    { name: 'A#', semitone: 10 },
    { name: 'B', semitone: 11 },
  ];
}
