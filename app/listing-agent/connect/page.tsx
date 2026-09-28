"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { apiFetch, extractErrorMessage } from "@/lib/api";

/**
 * One-click connect: Listing Agent sends the store admin here. Approving creates an API key
 * on the backend, which sends it straight to Listing Agent — nobody copies keys by hand.
 * When Listing Agent runs on the admin's own PC (localhost), the hosted backend can't reach it,
 * so the backend returns the key and this page submits it to Listing Agent from the browser.
 */
export default function ListingAgentConnectPage() {
  return (
    <Suspense fallback={null}>
      <Connect />
    </Suspense>
  );
}

function host(url: string | null): string {
  try {
    return url ? new URL(url).host : "";
  } catch {
    return "";
  }
}

/** Submit the key to Listing Agent's callback as a normal form post (a page navigation, so it
 *  also works for http://localhost). Listing Agent then redirects back to its Stores page. */
function postToListingAgent(action: string, fields: Record<string, string>) {
  const form = document.createElement("form");
  form.method = "POST";
  form.action = action;
  form.style.display = "none";
  for (const [name, value] of Object.entries(fields)) {
    const input = document.createElement("input");
    input.type = "hidden";
    input.name = name;
    input.value = value;
    form.appendChild(input);
  }
  document.body.appendChild(form);
  form.submit();
}

function withParam(url: string, param: string): string {
  return url + (url.includes("?") ? "&" : "?") + param;
}

function Connect() {
  const params = useSearchParams();
  const { user, loading } = useAuth();
  const state = params.get("state") || "";
  const callbackUrl = params.get("callback_url") || "";
  const returnUrl = params.get("return_url") || "";
  const appName = params.get("app") || "Listing Agent";
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const valid = state.length >= 8 && host(callbackUrl) && host(returnUrl);
  const here = typeof window !== "undefined" ? window.location.pathname + window.location.search : "/";

  async function approve() {
    setBusy(true);
    setError(null);
    try {
      const res = await apiFetch("/listing-api/connect", {
        method: "POST",
        body: JSON.stringify({ state, callback_url: callbackUrl }),
      });
      if (!res.ok) {
        setError(extractErrorMessage(await res.json().catch(() => ({})), "Couldn't connect. Please try again."));
        setBusy(false);
        return;
      }
      const out = await res.json().catch(() => ({}));
      if (out && out.deliver === "browser" && typeof out.api_key === "string") {
        // Always post to the callback this page was opened with, never one from the response.
        postToListingAgent(callbackUrl, {
          state,
          api_key: out.api_key,
          store_name: typeof out.store_name === "string" ? out.store_name : "",
        });
        return;
      }
      window.location.href = withParam(returnUrl, "success=1");
    } catch {
      setError("Couldn't reach the store's server. Please try again.");
      setBusy(false);
    }
  }

  return (
    <main className="min-h-[70vh] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md rounded-2xl border border-sc-border bg-sc-surface p-8 shadow-sm">
        {!valid ? (
          <>
            <h1 className="text-xl font-semibold text-sc-ink">This link isn’t complete</h1>
            <p className="mt-2 text-sm text-sc-muted">Start again from {appName}’s Stores page.</p>
          </>
        ) : loading ? (
          <p className="text-sm text-sc-muted">Loading…</p>
        ) : !user ? (
          <>
            <h1 className="text-xl font-semibold text-sc-ink">Connect {appName}</h1>
            <p className="mt-2 text-sm text-sc-muted">Log in with your store’s admin account to continue.</p>
            <Link href={`/login?redirect=${encodeURIComponent(here)}`}
              className="mt-6 inline-flex w-full justify-center rounded-xl bg-sc-ink px-4 py-3 text-sm font-semibold text-sc-bg">
              Log in
            </Link>
          </>
        ) : user.role !== "admin" ? (
          <>
            <h1 className="text-xl font-semibold text-sc-ink">Admin account needed</h1>
            <p className="mt-2 text-sm text-sc-muted">
              You’re logged in as {user.email}, which isn’t this store’s admin. Log in with the admin account to connect {appName}.
            </p>
          </>
        ) : (
          <>
            <h1 className="text-xl font-semibold text-sc-ink">Connect {appName} to your store?</h1>
            <p className="mt-3 text-sm text-sc-muted">{appName} ({host(callbackUrl)}) will be able to:</p>
            <ul className="mt-3 space-y-2 text-sm text-sc-ink">
              <li>• Add products to your store and update the ones it added</li>
              <li>• Read your category names, and add a category when a product needs one</li>
            </ul>
            <p className="mt-3 text-sm text-sc-muted">It can’t see your customers, orders or payments.</p>
            {error && <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
            <div className="mt-6 flex gap-3">
              <button type="button" onClick={() => (window.location.href = withParam(returnUrl, "denied=1"))}
                disabled={busy}
                className="flex-1 rounded-xl border border-sc-border px-4 py-3 text-sm font-semibold text-sc-ink">
                Cancel
              </button>
              <button type="button" onClick={approve} disabled={busy}
                className="flex-1 rounded-xl bg-sc-ink px-4 py-3 text-sm font-semibold text-sc-bg disabled:opacity-60">
                {busy ? "Connecting…" : "Approve"}
              </button>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
