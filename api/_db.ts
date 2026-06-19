import { mkdirSync } from 'node:fs';
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';

const databasePath = process.env.SQLITE_PATH ?? path.resolve(process.cwd(), 'data', 'rsvps.sqlite');
const databaseDir = path.dirname(databasePath);

mkdirSync(databaseDir, { recursive: true });

const db = new DatabaseSync(databasePath);

db.exec('PRAGMA journal_mode = WAL');
db.exec('PRAGMA busy_timeout = 5000');
db.exec('PRAGMA foreign_keys = ON');

let schemaReady = false;

export type AttendanceStatus = 'Будет' | 'Не сможет';
export type ReadingStatus = 'Не прочитано' | 'Готовится' | 'Прочитано';

export interface RsvpRow {
  id: number;
  name: string;
  attendance: AttendanceStatus;
  reading_status: ReadingStatus | null;
  wishes: string | null;
  created_at: string;
}

export interface RsvpRecord {
  id: number;
  name: string;
  attendance: AttendanceStatus;
  readingStatus: ReadingStatus;
  wishes: string;
  date: string;
  createdAt: string;
}

export function ensureRsvpSchema() {
  if (schemaReady) {
    return;
  }

  db.exec(`
    CREATE TABLE IF NOT EXISTS rsvps (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      attendance TEXT NOT NULL CHECK (attendance IN ('Будет', 'Не сможет')),
      wishes TEXT NOT NULL DEFAULT '',
      reading_status TEXT NOT NULL DEFAULT 'Не прочитано' CHECK (reading_status IN ('Не прочитано', 'Готовится', 'Прочитано')),
      created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
    )
  `);

  const columns = db.prepare('PRAGMA table_info(rsvps)').all() as Array<{ name: string }>;
  const hasReadingStatus = columns.some((column) => column.name === 'reading_status');

  if (!hasReadingStatus) {
    db.exec("ALTER TABLE rsvps ADD COLUMN reading_status TEXT NOT NULL DEFAULT 'Не прочитано'");
  }

  schemaReady = true;
}

export function createRsvp(input: {
  name: string;
  attendance: AttendanceStatus;
  wishes: string;
}) {
  ensureRsvpSchema();

  const result = db
    .prepare('INSERT INTO rsvps (name, attendance, wishes) VALUES (?, ?, ?)')
    .run(input.name, input.attendance, input.wishes);

  const row = getRsvpById(Number(result.lastInsertRowid));

  if (!row) {
    throw new Error('Created RSVP not found');
  }

  return row;
}

export function listRsvps() {
  ensureRsvpSchema();

  return db
    .prepare('SELECT id, name, attendance, reading_status, wishes, created_at FROM rsvps ORDER BY created_at DESC')
    .all() as unknown as RsvpRow[];
}

export function updateRsvpAttendance(id: number, attendance: AttendanceStatus) {
  ensureRsvpSchema();

  db.prepare('UPDATE rsvps SET attendance = ? WHERE id = ?').run(attendance, id);

  return getRsvpById(id);
}

export function updateRsvpReadingStatus(id: number, readingStatus: ReadingStatus) {
  ensureRsvpSchema();

  db.prepare('UPDATE rsvps SET reading_status = ? WHERE id = ?').run(readingStatus, id);

  return getRsvpById(id);
}

export function deleteRsvp(id: number) {
  ensureRsvpSchema();

  const result = db.prepare('DELETE FROM rsvps WHERE id = ?').run(id);

  return result.changes > 0;
}

export function mapRsvpRow(row: RsvpRow): RsvpRecord {
  const createdAt = new Date(row.created_at).toISOString();

  return {
    id: row.id,
    name: row.name,
    attendance: row.attendance,
    readingStatus: row.reading_status ?? 'Не прочитано',
    wishes: row.wishes ?? '',
    createdAt,
    date: new Intl.DateTimeFormat('ru-RU', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(createdAt)),
  };
}

function getRsvpById(id: number) {
  const row = db
    .prepare('SELECT id, name, attendance, reading_status, wishes, created_at FROM rsvps WHERE id = ?')
    .get(id) as RsvpRow | undefined;

  return row ?? null;
}
