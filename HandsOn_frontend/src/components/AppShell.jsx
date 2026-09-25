import { createElement, useEffect, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import {
  FaBars,
  FaBell,
  FaClipboardList,
  FaHome,
  FaSignOutAlt,
  FaTimes,
  FaUsers,
} from "react-icons/fa";
import { jwtDecode } from "jwt-decode";
import api, { API_URL } from "../api/client";
import { cn } from "../lib/cn";
import Button from "./ui/Button";

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: FaHome },
  { to: "/events-feed", label: "Events", icon: FaClipboardList },
  { to: "/organizations", label: "Organizations", icon: FaUsers },
  { to: "/help-request", label: "Help", icon: FaBell },
  { to: "/teams", label: "Teams", icon: FaUsers },
];

function formatNotification(item) {
  const p = item.payload || {};
  switch (item.type) {
    case "waitlisted":
      return `You're on the waitlist for ${p.eventTitle || "an event"}`;
    case "waitlist_promoted":
      return `A waitlist spot opened for ${p.eventTitle || "an event"}`;
    case "event_cancelled":
      return `${p.eventTitle || "An event"} was cancelled`;
    case "event_updated":
      return `${p.eventTitle || "An event"} was updated`;
    case "join_confirmed":
      return `You're confirmed for ${p.eventTitle || "an event"}`;
    case "event_join":
      return `Someone joined ${p.eventTitle || "your event"}`;
    case "attendance_marked":
      return `Attendance marked as ${p.status} for ${p.eventTitle || "an event"}`;
    case "help_comment":
      return "New comment on your help request";
    case "help_claimed":
      return "Someone claimed your help request";
    case "team_join":
      return "A volunteer joined your team";
    case "team_invite_accepted":
      return "Your team invite was accepted";
    case "event_reminder":
      return `Reminder: ${p.eventTitle || "your event"} starts in ${p.window || "soon"}`;
    case "thank_you":
      return `Thank you for volunteering at ${p.eventTitle || "the event"}`;
    case "bulk_message":
      return p.subject || p.body || "Message from organizer";
    default:
      return item.type.replaceAll("_", " ");
  }
}

export default function AppShell({ setAuth, title, children, actions }) {
  const navigate = useNavigate();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [bellOpen, setBellOpen] = useState(false);
  const [userId, setUserId] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      setUserId(jwtDecode(token).user);
    } catch {
      setUserId(null);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    const token = localStorage.getItem("token");
    if (!token) return undefined;

    const load = async () => {
      try {
        const res = await api.get("/notifications");
        if (cancelled) return;
        setNotifications(res.data?.data?.items || []);
        setUnreadCount(res.data?.data?.unreadCount || 0);
      } catch {
        // ignore
      }
    };
    load();

    const streamUrl = `${API_URL}/notifications/stream?token=${encodeURIComponent(token)}`;
    const es = new EventSource(streamUrl);
    es.addEventListener("notification", (ev) => {
      try {
        const data = JSON.parse(ev.data);
        if (data?.item) {
          setNotifications((prev) => {
            if (prev.some((n) => n.id === data.item.id)) return prev;
            return [data.item, ...prev].slice(0, 40);
          });
          setUnreadCount((c) => c + 1);
        } else {
          load();
        }
      } catch {
        load();
      }
    });
    es.onerror = () => {
      // Browser reconnects EventSource automatically.
    };

    return () => {
      cancelled = true;
      es.close();
    };
  }, []);

  useEffect(() => {
    if (!drawerOpen) return undefined;
    const onKey = (e) => {
      if (e.key === "Escape") setDrawerOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [drawerOpen]);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user_id");
    setAuth?.(false, null);
    navigate("/login");
  };

  const markAllRead = async () => {
    try {
      const res = await api.post("/notifications/read", {});
      setNotifications(res.data?.data?.items || []);
      setUnreadCount(res.data?.data?.unreadCount || 0);
    } catch {
      // ignore
    }
  };

  const NavContent = ({ onNavigate }) => (
    <nav className="flex flex-col gap-1 p-4" aria-label="Main">
      <Link
        to="/"
        className="mb-6 font-display text-2xl text-[var(--color-teal-deep)]"
        onClick={onNavigate}
      >
        HandsOn
      </Link>
      {navItems.map(({ to, label, icon }) => (
        <NavLink
          key={to}
          to={to}
          onClick={onNavigate}
          className={({ isActive }) =>
            cn(
              "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition",
              isActive
                ? "bg-[var(--color-mist)] text-[var(--color-teal-deep)]"
                : "text-[var(--color-soil)] hover:bg-white"
            )
          }
        >
          {createElement(icon, { "aria-hidden": true })}
          {label}
        </NavLink>
      ))}
      <button
        type="button"
        onClick={() => {
          onNavigate?.();
          logout();
        }}
        className="mt-4 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-[var(--color-danger)] hover:bg-[#fdecec]"
      >
        <FaSignOutAlt aria-hidden />
        Logout
      </button>
    </nav>
  );

  return (
    <div className="min-h-screen">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-[var(--color-ink)]/8 bg-white/90 backdrop-blur md:block">
        <NavContent />
      </aside>

      {drawerOpen ? (
        <div className="fixed inset-0 z-40 md:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-[var(--color-ink)]/40"
            aria-label="Close menu"
            onClick={() => setDrawerOpen(false)}
          />
          <aside className="relative h-full w-72 bg-white shadow-xl fade-up">
            <div className="flex justify-end p-3">
              <Button
                variant="ghost"
                size="sm"
                aria-label="Close menu"
                onClick={() => setDrawerOpen(false)}
              >
                <FaTimes />
              </Button>
            </div>
            <NavContent onNavigate={() => setDrawerOpen(false)} />
          </aside>
        </div>
      ) : null}

      <div className="md:pl-64">
        <header className="sticky top-0 z-20 border-b border-[var(--color-ink)]/8 bg-white/80 backdrop-blur">
          <div className="flex items-center justify-between gap-3 px-4 py-3 sm:px-6">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                className="md:hidden"
                aria-label="Open menu"
                onClick={() => setDrawerOpen(true)}
              >
                <FaBars />
              </Button>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--color-teal)]">
                  HandsOn
                </p>
                {title ? (
                  <h1 className="font-display text-xl text-[var(--color-ink)] sm:text-2xl">
                    {title}
                  </h1>
                ) : null}
              </div>
            </div>

            <div className="flex items-center gap-2">
              {actions}
              <div className="relative">
                <Button
                  variant="secondary"
                  size="sm"
                  aria-label="Notifications"
                  aria-expanded={bellOpen}
                  onClick={() => {
                    setBellOpen((v) => !v);
                    setMenuOpen(false);
                  }}
                >
                  <FaBell />
                  {unreadCount > 0 ? (
                    <span className="ml-1 rounded-md bg-[var(--color-danger)] px-1.5 text-xs text-white">
                      {unreadCount}
                    </span>
                  ) : null}
                </Button>
                {bellOpen ? (
                  <div className="absolute right-0 mt-2 w-80 rounded-xl border border-[var(--color-ink)]/10 bg-white p-2 shadow-lg">
                    <div className="mb-2 flex items-center justify-between px-2">
                      <p className="text-sm font-semibold">Notifications</p>
                      <button
                        type="button"
                        className="text-xs font-semibold text-[var(--color-teal-deep)]"
                        onClick={markAllRead}
                      >
                        Mark all read
                      </button>
                    </div>
                    <div className="max-h-72 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <p className="px-2 py-4 text-sm text-[var(--color-soil)]/70">
                          You're all caught up.
                        </p>
                      ) : (
                        notifications.map((n) => (
                          <div
                            key={n.id}
                            className={cn(
                              "rounded-lg px-2 py-2 text-sm",
                              !n.read_at && "bg-[var(--color-mist)]"
                            )}
                          >
                            {formatNotification(n)}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                ) : null}
              </div>
              <div className="relative">
                <Button
                  variant="secondary"
                  size="sm"
                  aria-label="User menu"
                  aria-expanded={menuOpen}
                  onClick={() => {
                    setMenuOpen((v) => !v);
                    setBellOpen(false);
                  }}
                >
                  Account
                </Button>
                {menuOpen ? (
                  <div className="absolute right-0 mt-2 w-44 rounded-xl border border-[var(--color-ink)]/10 bg-white p-2 shadow-lg">
                    {userId ? (
                      <Link
                        to={`/edit-profile/${userId}`}
                        className="block rounded-lg px-3 py-2 text-sm hover:bg-[var(--color-mist)]"
                        onClick={() => setMenuOpen(false)}
                      >
                        Edit profile
                      </Link>
                    ) : null}
                    <button
                      type="button"
                      className="block w-full rounded-lg px-3 py-2 text-left text-sm text-[var(--color-danger)] hover:bg-[#fdecec]"
                      onClick={logout}
                    >
                      Logout
                    </button>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </header>

        <main className="px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
