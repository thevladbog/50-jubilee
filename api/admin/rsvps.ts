import type { RsvpRow } from '../_db';
import { ensureRsvpSchema, mapRsvpRow, sql } from '../_db';

export const config = {
  runtime: 'edge',
};

type AdminBody = {
  secret?: unknown;
};

type UpdateRsvpBody = AdminBody & {
  id?: unknown;
  attendance?: unknown;
  readingStatus?: unknown;
};

export default async function handler(request: Request) {
  if (request.method !== 'POST' && request.method !== 'PATCH') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 });
  }

  const adminSecret = process.env.ADMIN_SECRET;
  let body: AdminBody | UpdateRsvpBody;

  try {
    body = (await request.json()) as AdminBody | UpdateRsvpBody;
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const incomingSecret = typeof body.secret === 'string' ? body.secret : '';

  if (!adminSecret || incomingSecret !== adminSecret) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await ensureRsvpSchema();

  if (request.method === 'PATCH') {
    const id = Number((body as UpdateRsvpBody).id);
    const attendance = (body as UpdateRsvpBody).attendance;
    const readingStatus = (body as UpdateRsvpBody).readingStatus;

    if (!Number.isInteger(id) || id <= 0) {
      return Response.json({ error: 'Invalid RSVP id' }, { status: 400 });
    }

    if (readingStatus !== undefined) {
      if (readingStatus !== 'Не прочитано' && readingStatus !== 'Готовится' && readingStatus !== 'Прочитано') {
        return Response.json({ error: 'Invalid reading status value' }, { status: 400 });
      }

      const rows = await sql`
        UPDATE rsvps
        SET reading_status = ${readingStatus}
        WHERE id = ${id}
        RETURNING id, name, attendance, reading_status, wishes, created_at
      `;

      const [row] = rows as RsvpRow[];

      if (!row) {
        return Response.json({ error: 'RSVP not found' }, { status: 404 });
      }

      return Response.json(mapRsvpRow(row));
    }

    if (attendance !== 'Будет' && attendance !== 'Не сможет') {
      return Response.json({ error: 'Invalid attendance value' }, { status: 400 });
    }

    const rows = await sql`
      UPDATE rsvps
      SET attendance = ${attendance}
      WHERE id = ${id}
      RETURNING id, name, attendance, reading_status, wishes, created_at
    `;

    const [row] = rows as RsvpRow[];

    if (!row) {
      return Response.json({ error: 'RSVP not found' }, { status: 404 });
    }

    return Response.json(mapRsvpRow(row));
  }

  const rows = await sql`
    SELECT id, name, attendance, reading_status, wishes, created_at
    FROM rsvps
    ORDER BY created_at DESC
  `;

  return Response.json((rows as RsvpRow[]).map(mapRsvpRow));
}
