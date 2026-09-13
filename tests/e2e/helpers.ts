export const MOCK_CONTROL = "http://localhost:4001/__control";

export async function setBackend(mode: "up" | "down") {
  const res = await fetch(MOCK_CONTROL, {
    method: "POST",
    body: JSON.stringify({ mode }),
  });
  if (!res.ok) throw new Error(`mock control failed: ${res.status}`);
}
