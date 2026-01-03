export type GoogleMeetUpsertInput = {
  summary: string;
  description?: string;
  startAt: string; // ISO
  endAt: string;   // ISO
  timeZone?: string;
};

export type GoogleMeetUpsertResponse = {
  eventId: string;
  htmlLink?: string;
  meetUrl: string;
};

// ✅ Create a Google Calendar event + Meet link
export async function createGoogleMeetEvent(
  input: GoogleMeetUpsertInput
): Promise<GoogleMeetUpsertResponse> {
  const res = await fetch("/api/integrations/google/calendar/meet", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(input),
  });

  if (!res.ok) {
    const msg = await safeErrorMessage(res);
    throw new Error(msg || "Failed to create Google Meet event");
  }

  return res.json();
}

// ✅ Update an existing Google Calendar event (keep same Meet link)
export async function updateGoogleMeetEvent(
  eventId: string,
  input: GoogleMeetUpsertInput
): Promise<GoogleMeetUpsertResponse> {
  const res = await fetch(`/api/integrations/google/calendar/meet/${eventId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(input),
  });

  if (!res.ok) {
    const msg = await safeErrorMessage(res);
    throw new Error(msg || "Failed to update Google Meet event");
  }

  return res.json();
}

async function safeErrorMessage(res: Response) {
  try {
    const data = await res.json();
    return data?.message || data?.error || "";
  } catch {
    return "";
  }
}
