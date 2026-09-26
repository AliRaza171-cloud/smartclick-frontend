"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  link: string | null;
  is_read: boolean;
  created_at: string;
}

const POLL_INTERVAL_MS = 30_000;

export default function NotificationBell() {
  const { user } = useAuth();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const rootRef = useRef<HTMLDivElement>(null);

  async function fetchUnreadCount() {
    const res = await apiFetch("/notifications/unread-count");
    if (res.ok) {
      const data = await res.json();
      setUnreadCount(data.count);
    }
  }

  async function fetchNotifications() {
    const res = await apiFetch("/notifications");
    if (res.ok) setNotifications(await res.json());
  }

  useEffect(() => {
    if (!user) return;
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function handleToggle() {
    const next = !open;
    setOpen(next);
    if (next) await fetchNotifications();
  }

  async function handleNotificationClick(n: Notification) {
    if (!n.is_read) {
      await apiFetch(`/notifications/${n.id}/read`, { method: "PATCH" });
      setUnreadCount((c) => Math.max(0, c - 1));
    }
    setOpen(false);
    if (n.link) router.push(n.link);
  }

  async function handleMarkAllRead() {
    await apiFetch("/notifications/read-all", { method: "PATCH" });
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    setUnreadCount(0);
  }

  if (!user) return null;

  return (
    <div className="relative" ref={rootRef}>
      <button
        onClick={handleToggle}
        aria-label="Notifications"
        className="relative w-10 h-10 rounded-full flex items-center justify-center transition-colors hover:border-[#22C08C]"
        style={{ border: "1px solid #9DB3A6" }}
      >
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#F3F2EE" strokeWidth={2}>
          <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-[#22C08C] text-[#0E1712] text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white border border-sc-border rounded-xl shadow-lg z-50 max-h-96 overflow-y-auto">
          <div className="flex items-center justify-between px-4 py-3 border-b border-sc-border">
            <span className="text-sm font-semibold">Notifications</span>
            {notifications.some((n) => !n.is_read) && (
              <button onClick={handleMarkAllRead} className="text-xs text-sc-accent">
                Mark all read
              </button>
            )}
          </div>

          {notifications.length === 0 ? (
            <div className="px-4 py-8 text-center text-sm text-sc-faint">No notifications yet.</div>
          ) : (
            notifications.map((n) => (
              <button
                key={n.id}
                onClick={() => handleNotificationClick(n)}
                className="w-full text-left px-4 py-3 border-b border-sc-border last:border-0 hover:bg-sc-bg"
                style={{ background: n.is_read ? "transparent" : "var(--sc-accent-soft)" }}
              >
                <div className="text-sm font-semibold mb-0.5">{n.title}</div>
                <div className="text-xs text-sc-muted">{n.message}</div>
                <div className="text-[10px] text-sc-faint mt-1">
                  {new Date(n.created_at).toLocaleString()}
                </div>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}