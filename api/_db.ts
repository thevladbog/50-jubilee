import { neon } from '@neondatabase/serverless';

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error('DATABASE_URL is required');
}

export const sql = neon(databaseUrl);

let schemaReady: Promise<void> | null = null;

export function ensureRsvpSchema() {
  schemaReady ??= sql`
    CREATE TABLE IF NOT EXISTS rsvps (
      id BIGSERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      attendance TEXT NOT NULL CHECK (attendance IN ('Будет', 'Не сможет')),
      wishes TEXT NOT NULL DEFAULT '',
      reading_status TEXT NOT NULL DEFAULT 'Не прочитано' CHECK (reading_status IN ('Не прочитано', 'Готовится', 'Прочитано')),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `
    .then(() => sql`
      ALTER TABLE rsvps
      ADD COLUMN IF NOT EXISTS reading_status TEXT NOT NULL DEFAULT 'Не прочитано'
    `)
    .then(() => undefined);

  return schemaReady;
}

export interface RsvpRow {
  id: number;
  name: string;
  attendance: 'Будет' | 'Не сможет';
  reading_status: 'Не прочитано' | 'Готовится' | 'Прочитано' | null;
  wishes: string | null;
  created_at: string;
}

export type ReadingStatus = 'Не прочитано' | 'Готовится' | 'Прочитано';

export interface RsvpRecord {
  id: number;
  name: string;
  attendance: 'Будет' | 'Не сможет';
  readingStatus: ReadingStatus;
  wishes: string;
  date: string;
  createdAt: string;
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
