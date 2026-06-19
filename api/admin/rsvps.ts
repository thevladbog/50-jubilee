import {
  deleteRsvp,
  ensureRsvpSchema,
  listRsvps,
  mapRsvpRow,
  updateRsvpAttendance,
  updateRsvpReadingStatus,
} from '../_db';

export const config = {
  runtime: 'edge',
};

type AdminBody = {
  secret?: unknown;
};

type AdminRole = 'admin' | 'presenter';

type UpdateRsvpBody = AdminBody & {
  id?: unknown;
  attendance?: unknown;
  readingStatus?: unknown;
};

export default async function handler(request: Request) {
  if (request.method !== 'POST' && request.method !== 'PATCH' && request.method !== 'DELETE') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 });
  }

  const adminSecret = process.env.ADMIN_SECRET;
  const presenterSecret = process.env.PRESENTER_SECRET?.trim() || 'ЯВедущий';
  let body: AdminBody | UpdateRsvpBody;

  try {
    body = (await request.json()) as AdminBody | UpdateRsvpBody;
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const incomingSecret = typeof body.secret === 'string' ? body.secret : '';
  let role: AdminRole | null = null;

  if (adminSecret && incomingSecret === adminSecret) {
    role = 'admin';
  } else if (incomingSecret === presenterSecret) {
    role = 'presenter';
  }

  if (!role) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await ensureRsvpSchema();

  if (request.method === 'DELETE') {
    if (role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const id = Number((body as UpdateRsvpBody).id);

    if (!Number.isInteger(id) || id <= 0) {
      return Response.json({ error: 'Invalid RSVP id' }, { status: 400 });
    }

    if (!deleteRsvp(id)) {
      return Response.json({ error: 'RSVP not found' }, { status: 404 });
    }

    return Response.json({ ok: true });
  }

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

      const row = updateRsvpReadingStatus(id, readingStatus);

      if (!row) {
        return Response.json({ error: 'RSVP not found' }, { status: 404 });
      }

      return Response.json(mapRsvpRow(row));
    }

    if (role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (attendance !== 'Будет' && attendance !== 'Не сможет') {
      return Response.json({ error: 'Invalid attendance value' }, { status: 400 });
    }

    const row = updateRsvpAttendance(id, attendance);

    if (!row) {
      return Response.json({ error: 'RSVP not found' }, { status: 404 });
    }

    return Response.json(mapRsvpRow(row));
  }

  return Response.json({
    role,
    rsvps: listRsvps().map(mapRsvpRow),
  });
}
