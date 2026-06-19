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

export async function fetchAdminRsvps(secret: string): Promise<RsvpRecord[]> {
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

  return response.json() as Promise<RsvpRecord[]>;
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
