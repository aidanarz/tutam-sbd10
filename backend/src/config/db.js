// src/config/db.js
// DB abstraction: Neon Postgres on Vercel, JSON fallback for local dev.

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { neon } from '@neondatabase/serverless';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, '../../data');
const DB_PATH = join(DATA_DIR, 'chord_generator.json');
const isServerless = Boolean(process.env.VERCEL);
const CONNECTION_STRING = process.env.POSTGRES_URL || process.env.DATABASE_URL || '';
const useNeon = Boolean(CONNECTION_STRING);
const sql = useNeon ? neon(CONNECTION_STRING) : null;

if (!isServerless) {
  mkdirSync(DATA_DIR, { recursive: true });
}

const NOTES = [
  { id: 1, name: 'C', semitone: 0 },
  { id: 2, name: 'C#', semitone: 1 },
  { id: 3, name: 'D', semitone: 2 },
  { id: 4, name: 'D#', semitone: 3 },
  { id: 5, name: 'E', semitone: 4 },
  { id: 6, name: 'F', semitone: 5 },
  { id: 7, name: 'F#', semitone: 6 },
  { id: 8, name: 'G', semitone: 7 },
  { id: 9, name: 'G#', semitone: 8 },
  { id: 10, name: 'A', semitone: 9 },
  { id: 11, name: 'A#', semitone: 10 },
  { id: 12, name: 'B', semitone: 11 },
];

const DEFAULT_DATA = {
  notes: NOTES,
  chord_progressions: [],
};

let inMemoryProgressions = [];

function readDbFile() {
  if (isServerless) {
    return { notes: NOTES, chord_progressions: inMemoryProgressions };
  }

  if (!existsSync(DB_PATH)) {
    try {
      writeFileSync(DB_PATH, JSON.stringify(DEFAULT_DATA, null, 2));
    } catch {
      return { ...DEFAULT_DATA };
    }
    return { ...DEFAULT_DATA };
  }
  try {
    return JSON.parse(readFileSync(DB_PATH, 'utf-8'));
  } catch {
    return { ...DEFAULT_DATA };
  }
}

function writeDbFile(data) {
  if (isServerless) {
    inMemoryProgressions = data?.chord_progressions || [];
    return;
  }

  writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

function toJsonArray(value) {
  if (Array.isArray(value)) return value;
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
}

export async function initDb() {
  try {
    if (!useNeon) {
      readDbFile();
      console.log('✅ Database ready in fallback mode');
      return;
    }

    await sql`
      CREATE TABLE IF NOT EXISTS notes (
        id INTEGER PRIMARY KEY,
        name TEXT NOT NULL UNIQUE,
        semitone INTEGER NOT NULL
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS chord_progressions (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        key_note TEXT NOT NULL,
        scale TEXT NOT NULL DEFAULT 'major',
        progression JSONB NOT NULL,
        chord_names JSONB,
        tempo INTEGER DEFAULT 120,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `;

    const countRows = await sql`SELECT COUNT(*)::int AS count FROM notes;`;
    const count = countRows?.[0]?.count ?? 0;

    if (count === 0) {
      for (const note of NOTES) {
        await sql`
          INSERT INTO notes (id, name, semitone)
          VALUES (${note.id}, ${note.name}, ${note.semitone})
          ON CONFLICT (id) DO NOTHING;
        `;
      }
    }

    console.log('✅ Neon database ready');
  } catch (error) {
    console.error('⚠️ initDb fallback mode:', error.message || error);
  }
}

export async function getNotes() {
  if (!useNeon) {
    return readDbFile().notes;
  }
  const rows = await sql`SELECT id, name, semitone FROM notes ORDER BY id ASC;`;
  return rows;
}

export async function getProgressions() {
  if (!useNeon) {
    return readDbFile().chord_progressions;
  }

  const rows = await sql`
    SELECT id, title, key_note, scale, progression, chord_names, tempo, created_at
    FROM chord_progressions
    ORDER BY created_at DESC;
  `;

  return rows.map((row) => ({
    ...row,
    progression: toJsonArray(row.progression),
    chord_names: toJsonArray(row.chord_names),
  }));
}

export async function saveProgression(record) {
  if (!useNeon) {
    const data = readDbFile();
    data.chord_progressions.push(record);
    writeDbFile(data);
    return record;
  }

  await sql`
    INSERT INTO chord_progressions (
      id, title, key_note, scale, progression, chord_names, tempo, created_at
    ) VALUES (
      ${record.id},
      ${record.title},
      ${record.key_note},
      ${record.scale},
      ${JSON.stringify(record.progression)}::jsonb,
      ${JSON.stringify(record.chord_names || [])}::jsonb,
      ${record.tempo},
      ${record.created_at}
    );
  `;

  return record;
}

export async function deleteProgressionById(id) {
  if (!useNeon) {
    const data = readDbFile();
    const idx = data.chord_progressions.findIndex((p) => p.id === id);
    if (idx === -1) return false;
    data.chord_progressions.splice(idx, 1);
    writeDbFile(data);
    return true;
  }

  const result = await sql`DELETE FROM chord_progressions WHERE id = ${id};`;
  return (result?.length ?? 0) > 0;
}

export const dbMode = useNeon ? 'neon' : (isServerless ? 'memory' : 'json');
