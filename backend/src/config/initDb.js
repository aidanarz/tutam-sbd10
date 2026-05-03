// src/config/initDb.js
// Initializes SQLite database with required tables
import Database from 'better-sqlite3';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { mkdirSync } from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DB_PATH = join(__dirname, '../../data/chord_generator.db');

// Ensure data directory exists
mkdirSync(join(__dirname, '../../data'), { recursive: true });

export function getDb() {
  const db = new Database(DB_PATH);
  db.pragma('journal_mode = WAL'); // Better performance
  return db;
}

export function initializeDatabase() {
  const db = getDb();

  // Notes reference table - chromatic scale
  db.exec(`
    CREATE TABLE IF NOT EXISTS notes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      semitone INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Chord progressions saved by user
  db.exec(`
    CREATE TABLE IF NOT EXISTS chord_progressions (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      key_note TEXT NOT NULL,
      scale TEXT NOT NULL DEFAULT 'major',
      detected_chord TEXT,
      progression TEXT NOT NULL,
      notes_used TEXT,
      tempo INTEGER DEFAULT 120,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Seed notes table if empty
  const noteCount = db.prepare('SELECT COUNT(*) as count FROM notes').get();
  if (noteCount.count === 0) {
    const notes = [
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

    const insert = db.prepare('INSERT INTO notes (name, semitone) VALUES (?, ?)');
    for (const note of notes) {
      insert.run(note.name, note.semitone);
    }
    console.log('✅ Notes table seeded');
  }

  db.close();
  console.log('✅ Database initialized at', DB_PATH);
}

// Run directly if called as script
initializeDatabase();
