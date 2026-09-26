"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { apiFetch, extractErrorMessage } from "@/lib/api";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface QA {
  id: string;
  question: string;
  answer: string | null;
  asker_name: string;
  created_at: string;
  answered_at: string | null;
}

function AnswerBox({ productId, questionId, onAnswered }: { productId: string; questionId: string; onAnswered: () => void }) {
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleAnswer() {
    if (!text.trim()) return;
    setSubmitting(true);
    await apiFetch(`/products/${productId}/questions/${questionId}/answer`, {
      method: "PATCH",
      body: JSON.stringify({ answer: text }),
    });
    setSubmitting(false);
    setText("");
    onAnswered();
  }

  return (
    <div className="mt-2 flex gap-2">
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Write an answer as the seller…"
        className="flex-1 rounded-lg border px-3 py-2 text-sm outline-none"
        style={{ borderColor: "var(--sc-border)" }}
      />
      <button
        onClick={handleAnswer}
        disabled={!text.trim() || submitting}
        className="rounded-lg text-white text-xs font-semibold px-4 disabled:opacity-50"
        style={{ background: "var(--sc-accent)" }}
      >
        {submitting ? "..." : "Answer"}
      </button>
    </div>
  );
}

export default function ProductQA({ productId }: { productId: string }) {
  const { user } = useAuth();
  const [items, setItems] = useState<QA[]>([]);
  const [loading, setLoading] = useState(true);
  const [newQuestion, setNewQuestion] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    const res = await fetch(`${API_BASE}/products/${productId}/questions`);
    if (res.ok) setItems(await res.json());
    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId]);

  async function handleAsk(e: React.FormEvent) {
    e.preventDefault();
    if (!newQuestion.trim()) return;

    setError(null);
    setSubmitting(true);
    const res = await apiFetch(`/products/${productId}/questions`, {
      method: "POST",
      body: JSON.stringify({ question: newQuestion }),
    });
    setSubmitting(false);

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(extractErrorMessage(body, "Couldn't submit your question."));
      return;
    }
    setNewQuestion("");
    load();
  }

  return (
        <div>

      {user ? (
        <form onSubmit={handleAsk} className="flex gap-2 mb-8">
          <input
            value={newQuestion}
            onChange={(e) => setNewQuestion(e.target.value)}
            placeholder="Ask a question about this product…"
            className="flex-1 rounded-lg border px-4 py-3 text-sm outline-none"
            style={{ borderColor: "var(--sc-border)" }}
          />
          <button
            type="submit"
            disabled={!newQuestion.trim() || submitting}
            className="rounded-lg text-white text-sm font-semibold px-5 disabled:opacity-50"
            style={{ background: "var(--sc-accent)" }}
          >
            {submitting ? "..." : "Ask"}
          </button>
        </form>
      ) : (
        <p className="text-sm text-sc-muted mb-8">
          <a href="/login" className="text-sc-accent">Sign in</a> to ask a question.
        </p>
      )}
      {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

      {loading ? (
        <p className="text-sm text-sc-muted">Loading…</p>
      ) : items.length === 0 ? (
        <p className="text-sm text-sc-muted">No questions yet — be the first to ask.</p>
      ) : (
        <div className="space-y-5">
          {items.map((q) => (
            <div key={q.id} className="border-b border-sc-border pb-5 last:border-0">
              <p className="text-sm font-semibold mb-1">Q: {q.question}</p>
              <p className="text-xs text-sc-faint mb-2">
                {q.asker_name} · {new Date(q.created_at).toLocaleDateString()}
              </p>
              {q.answer ? (
                <p className="text-sm text-sc-muted">
                  <span className="font-semibold text-sc-accent">A:</span> {q.answer}
                </p>
              ) : user?.role === "admin" ? (
                <AnswerBox productId={productId} questionId={q.id} onAnswered={load} />
              ) : (
                <p className="text-xs text-sc-faint italic">Awaiting an answer from the seller.</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}