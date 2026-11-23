// Thin API client. Every state-changing request carries the X-MailMind-Request
// header that the backend requires as CSRF protection.

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

export async function api<T = unknown>(path: string, init: RequestInit & { json?: unknown } = {}): Promise<T> {
  const { json, ...rest } = init;
  const method = (rest.method || (json !== undefined ? "POST" : "GET")).toUpperCase();
  const headers: Record<string, string> = { Accept: "application/json" };
  if (json !== undefined) headers["Content-Type"] = "application/json";
  if (method !== "GET") headers["X-MailMind-Request"] = "1";
  const res = await fetch(`/api${path}`, {
    ...rest,
    method,
    headers,
    credentials: "same-origin",
    body: json !== undefined ? JSON.stringify(json) : undefined,
  });
  if (res.status === 204) return undefined as T;
  const text = await res.text();
  const data = text ? JSON.parse(text) : undefined;
  if (!res.ok) {
    const detail = data?.detail;
    const msg = typeof detail === "string" ? detail : Array.isArray(detail) ? detail.map((d: any) => d.msg).join("; ") : res.statusText;
    throw new ApiError(res.status, msg);
  }
  return data as T;
}

export function qs(params: Record<string, string | number | boolean | undefined | null>): string {
  const p = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) if (v !== undefined && v !== null && v !== "") p.set(k, String(v));
  const s = p.toString();
  return s ? `?${s}` : "";
}

export function fmtDate(iso?: string | null, withTime = true): string {
  if (!iso) return "—";
  const d = new Date(iso);
  return withTime
    ? d.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })
    : d.toLocaleDateString(undefined, { dateStyle: "medium" });
}
