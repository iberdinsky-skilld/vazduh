export const MOCK_CONTROL = "http://localhost:4001/__control";

export async function setBackend(mode: "up" | "down" | "v2") {
  const res = await fetch(MOCK_CONTROL, {
    method: "POST",
    body: JSON.stringify({ mode }),
  });
  if (!res.ok) throw new Error(`mock control failed: ${res.status}`);
}

export const APP = "http://localhost:3100";

/** What Drupal's cron does after writing a new hour. */
export async function triggerRevalidate(secret = "e2e-secret") {
  return fetch(`${APP}/api/revalidate`, {
    method: "POST",
    headers: { "x-revalidate-secret": secret },
  });
}
