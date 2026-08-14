// Small JSON response helpers for route handlers.
export function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json" },
  });
}

export const error = (status: number, message: string) =>
  json({ error: message }, status);
