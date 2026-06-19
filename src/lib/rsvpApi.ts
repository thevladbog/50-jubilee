export type ReadingStatus = 'Не прочитано' | 'Готовится' | 'Прочитано';
export type AdminRole = 'admin' | 'presenter';

export interface RsvpRecord {
  id: number;
  name: string;
  attendance: 'Будет' | 'Не сможет';
  readingStatus: ReadingStatus;
  wishes: string;
  date: string;
  createdAt: string;
}

export interface AdminRsvpsResponse {
  role: AdminRole;
  rsvps: RsvpRecord[];
}

interface RsvpInput {
  name: string;
  attendance: string;
  wishes: string;
}

async function readErrorMessage(response: Response) {
  try {
    const data = await response.json();
    if (typeof data?.error === 'string') {
      return data.error;
    }
  } catch {
    // fall through to generic message
  }

  return 'Request failed';
}

export async function submitRsvp(payload: RsvpInput): Promise<RsvpRecord> {
  const response = await fetch('/api/rsvps', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(await readErrorMessage(response));
  }

  return response.json() as Promise<RsvpRecord>;
}

export async function fetchAdminRsvps(secret: string): Promise<AdminRsvpsResponse> {
  const response = await fetch('/api/admin/rsvps', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ secret }),
  });

  if (!response.ok) {
    throw new Error(await readErrorMessage(response));
  }

  const data = await response.json();

  if (Array.isArray(data)) {
    return {
      role: secret === 'ЯВедущий' ? 'presenter' : 'admin',
      rsvps: data as RsvpRecord[],
    };
  }

  return data as AdminRsvpsResponse;
}

export async function updateAdminRsvpAttendance(
  secret: string,
  id: number,
  attendance: RsvpRecord['attendance'],
): Promise<RsvpRecord> {
  const response = await fetch('/api/admin/rsvps', {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ secret, id, attendance }),
  });

  if (!response.ok) {
    throw new Error(await readErrorMessage(response));
  }

  return response.json() as Promise<RsvpRecord>;
}

export async function updateAdminRsvpReadingStatus(
  secret: string,
  id: number,
  readingStatus: ReadingStatus,
): Promise<RsvpRecord> {
  const response = await fetch('/api/admin/rsvps', {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ secret, id, readingStatus }),
  });

  if (!response.ok) {
    throw new Error(await readErrorMessage(response));
  }

  return response.json() as Promise<RsvpRecord>;
}

export async function deleteAdminRsvp(secret: string, id: number): Promise<void> {
  const response = await fetch('/api/admin/rsvps', {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ secret, id }),
  });

  if (!response.ok) {
    throw new Error(await readErrorMessage(response));
  }
}
