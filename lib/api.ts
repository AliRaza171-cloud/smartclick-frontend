/**
 * The access token lives ONLY in this module's memory (a plain variable),
 * never in localStorage/sessionStorage — that's the whole point of the
 * pairing with an httpOnly refresh cookie on the backend. It's lost on a
 * hard page reload, which is why `initAuth()` below calls /auth/refresh on
 * app load to silently re-establish a session from the cookie.
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

let accessToken: string | null = null;
let refreshInFlight: Promise<boolean> | null = null;

export function setAccessToken(token: string | null) {
  accessToken = token;
}

export function getAccessToken() {
  return accessToken;
}

function readCsrfCookie(): string | null {
  const match = document.cookie.match(/(?:^|; )smartclick_csrf=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : null;
}

async function doRefresh(): Promise<boolean> {
  const res = await fetch(`${API_BASE}/auth/refresh`, {
    method: "POST",
    credentials: "include",
    headers: { "X-CSRF-Token": readCsrfCookie() || "" },
  });
  if (!res.ok) {
    accessToken = null;
    return false;
  }
  const data = await res.json();
  accessToken = data.access_token;
  return true;
}

export async function initAuth(): Promise<boolean> {
  refreshInFlight = doRefresh();
  const ok = await refreshInFlight;
  refreshInFlight = null;
  return ok;
}

interface RequestOptions extends RequestInit {
  skipAuth?: boolean;
}

export async function apiFetch(path: string, options: RequestOptions = {}) {
  const { skipAuth, headers, ...rest } = options;

  const doFetch = () =>
    fetch(`${API_BASE}${path}`, {
      ...rest,
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...(skipAuth || !accessToken ? {} : { Authorization: `Bearer ${accessToken}` }),
        ...headers,
      },
    });

  let res = await doFetch();

  if (res.status === 401 && !skipAuth) {
    const refreshed = refreshInFlight ? await refreshInFlight : await initAuth();
    if (refreshed) {
      res = await doFetch();
    }
  }

  return res;
}

/**
 * FastAPI returns errors in two different shapes: a plain string for our
 * own HTTPException messages, or an array of {type, loc, msg, input}
 * objects for Pydantic validation failures (422s). Rendering the array
 * directly as a React child crashes the page, so every error-handling spot
 * in the app should go through this instead of reading body.detail raw.
 */
export function extractErrorMessage(body: any, fallback: string): string {
  if (typeof body?.detail === "string") return body.detail;
  if (Array.isArray(body?.detail)) {
    return body.detail.map((e: any) => e.msg).join(" ") || fallback;
  }
  return fallback;
}

export async function apiFetchMultipart(path: string, formData: FormData) {
  const doFetch = () =>
    fetch(`${API_BASE}${path}`, {
      method: "POST",
      credentials: "include",
      headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
      body: formData,
    });

  let res = await doFetch();

  if (res.status === 401) {
    const refreshed = refreshInFlight ? await refreshInFlight : await initAuth();
    if (refreshed) {
      res = await doFetch();
    }
  }

  return res;
}

export async function logout() {
  await apiFetch("/auth/logout", {
    method: "POST",
    headers: { "X-CSRF-Token": readCsrfCookie() || "" },
  });
  accessToken = null;
}