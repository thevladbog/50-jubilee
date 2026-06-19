import type { RsvpRow } from './_db';
import { ensureRsvpSchema, mapRsvpRow, sql } from './_db';

export const config = {
  runtime: 'edge',
};

type CreateRsvpBody = {
  name?: unknown;
  attendance?: unknown;
  wishes?: unknown;
};

export default async function handler(request: Request) {
  if (request.method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 });
  }

  await ensureRsvpSchema();

  let body: CreateRsvpBody;

  try {
    body = (await request.json()) as CreateRsvpBody;
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const name = typeof body.name === 'string' ? body.name.trim() : '';
  const wishes = typeof body.wishes === 'string' ? body.wishes.trim() : '';
  const attendanceValue =
    body.attendance === 'Будет' || body.attendance === 'Не сможет'
      ? body.attendance
      : body.attendance === 'yes'
        ? 'Будет'
        : body.attendance === 'no'
          ? 'Не сможет'
          : '';

  if (!name || !attendanceValue) {
    return Response.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const rows = await sql`
    INSERT INTO rsvps (name, attendance, wishes)
    VALUES (${name}, ${attendanceValue}, ${wishes})
    RETURNING id, name, attendance, reading_status, wishes, created_at
  `;

  const [row] = rows as RsvpRow[];

  return Response.json(mapRsvpRow(row), { status: 201 });
}
