import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import api from "../api/client";
import AppShell from "../components/AppShell";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import EmptyState from "../components/ui/EmptyState";
import Input from "../components/ui/Input";
import Select from "../components/ui/Select";
import Alert from "../components/ui/Alert";
import { Spinner } from "../components/ui/Spinner";
import { useToast } from "../components/ToastProvider";
import Modal from "../components/ui/Modal";

const CATEGORIES = [
  "All",
  "Education",
  "Environment",
  "Social Activity",
  "Healthcare",
  "Animal Welfare",
  "Community Development",
  "Other",
];

export default function Events({ setAuth }) {
  const navigate = useNavigate();
  const toast = useToast();
  const [events, setEvents] = useState([]);
  const [recommended, setRecommended] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [joiningId, setJoiningId] = useState(null);
  const [managingId, setManagingId] = useState(null);
  const [registrants, setRegistrants] = useState([]);
  const [filters, setFilters] = useState({ category: "All", location: "", date: "" });
  const currentUserId = (() => {
    try {
      return jwtDecode(localStorage.getItem("token") || "").user;
    } catch {
      return null;
    }
  })();

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const [eventsRes, recommendedRes] = await Promise.all([
        api.get("/events"),
        api.get("/events/recommended"),
      ]);
      setEvents(eventsRes.data?.data || []);
      setRecommended(recommendedRes.data?.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load events");
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    return events.filter((event) => {
      const categoryOk =
        filters.category === "All" ||
        String(event.category || "").toLowerCase() === filters.category.toLowerCase();
      const locationOk =
        !filters.location ||
        String(event.location || "")
          .toLowerCase()
          .includes(filters.location.toLowerCase());
      const dateOk =
        !filters.date ||
        (event.date &&
          new Date(event.date).toISOString().slice(0, 10) === filters.date);
      return categoryOk && locationOk && dateOk;
    });
  }, [events, filters]);

  const join = async (event) => {
    setJoiningId(event.id);
    try {
      await api.post(`/events/${event.id}/join`, {
        join_date: new Date().toISOString().slice(0, 10),
      });
      toast.success("Joined event");
      await load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to join event");
    } finally {
      setJoiningId(null);
    }
  };

  const openAttendance = async (eventId) => {
    setManagingId(eventId);
    try {
      const res = await api.get(`/events/${eventId}/registrants`);
      setRegistrants(res.data?.data?.registrants || []);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load registrants");
      setManagingId(null);
    }
  };

  const markAttendance = async (userId, status) => {
    try {
      await api.post(`/events/${managingId}/attendance`, { user_id: userId, status });
      toast.success(`Marked ${status}`);
      const res = await api.get(`/events/${managingId}/registrants`);
      setRegistrants(res.data?.data?.registrants || []);
      await load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update attendance");
    }
  };

  return (
    <AppShell
      setAuth={setAuth}
      title="Events"
      actions={
        <Button size="sm" onClick={() => navigate("/create-event")}>
          Create event
        </Button>
      }
    >
      {!loading && recommended.length > 0 ? (
        <section className="mb-8">
          <h2 className="mb-3 font-display text-2xl">Recommended for you</h2>
          <div className="grid gap-3 sm:grid-cols-3">
            {recommended.slice(0, 3).map((event) => (
              <article key={`rec-${event.id}`} className="rounded-2xl border border-[var(--color-teal)]/20 bg-[var(--color-mist)] p-4">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold">{event.title}</h3>
                  <Badge tone="leaf">Score {event.matchScore}</Badge>
                </div>
                <p className="mt-2 line-clamp-2 text-sm text-[var(--color-soil)]/80">
                  {event.details}
                </p>
                <Button
                  size="sm"
                  className="mt-3"
                  loading={joiningId === event.id}
                  onClick={() => join(event)}
                >
                  Join
                </Button>
              </article>
            ))}
          </div>
        </section>
      ) : null}
      <form
        className="mb-6 grid gap-3 rounded-2xl bg-white/90 p-4 shadow-sm sm:grid-cols-4"
        onSubmit={(e) => e.preventDefault()}
      >
        <Select
          id="event-category"
          label="Category"
          value={filters.category}
          onChange={(e) => setFilters({ ...filters, category: e.target.value })}
        >
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c === "All" ? "All categories" : c}
            </option>
          ))}
        </Select>
        <Input
          id="event-location"
          label="Location"
          value={filters.location}
          onChange={(e) => setFilters({ ...filters, location: e.target.value })}
        />
        <Input
          id="event-date"
          label="Date"
          type="date"
          value={filters.date}
          onChange={(e) => setFilters({ ...filters, date: e.target.value })}
        />
        <div className="flex items-end">
          <Button
            type="button"
            variant="secondary"
            className="w-full"
            onClick={() => setFilters({ category: "All", location: "", date: "" })}
          >
            Reset
          </Button>
        </div>
      </form>

      {loading ? (
        <div className="flex justify-center py-16">
          <Spinner label="Loading events" />
        </div>
      ) : error ? (
        <Alert tone="error">{error}</Alert>
      ) : filtered.length === 0 ? (
        <EmptyState
          title="No events match"
          description="Try clearing filters or create a new opportunity."
          actionLabel="Create event"
          onAction={() => navigate("/create-event")}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((event) => (
            <article key={event.id} className="rounded-2xl bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <h3 className="font-display text-xl text-[var(--color-ink)]">{event.title}</h3>
                <Badge>{event.category || "General"}</Badge>
              </div>
              <p className="mt-3 line-clamp-3 text-sm text-[var(--color-soil)]/80">
                {event.details}
              </p>
              <p className="mt-4 text-sm text-[var(--color-soil)]">
                {event.location || "TBD"} ·{" "}
                {event.date ? new Date(event.date).toLocaleDateString() : "Flexible"}
              </p>
              <p className="mt-1 text-sm text-[var(--color-soil)]/70">
                {event.registeredVolunteers || 0}
                {event.member_limit ? ` / ${event.member_limit}` : ""} volunteers
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {event.user_joined ? (
                  <Badge tone="leaf">Joined</Badge>
                ) : (
                  <Button
                    size="sm"
                    loading={joiningId === event.id}
                    onClick={() => join(event)}
                  >
                    Join event
                  </Button>
                )}
                {String(event.created_by) === String(currentUserId) ? (
                  <Button size="sm" variant="secondary" onClick={() => openAttendance(event.id)}>
                    Attendance
                  </Button>
                ) : null}
              </div>
            </article>
          ))}
        </div>
      )}

      <Modal
        open={Boolean(managingId)}
        title="Mark attendance"
        onClose={() => setManagingId(null)}
      >
        <div className="space-y-3">
          {registrants.length === 0 ? (
            <p className="text-sm text-[var(--color-soil)]/70">No registrants yet.</p>
          ) : (
            registrants.map((person) => (
              <div
                key={person.user_id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-[var(--color-mist)] p-3"
              >
                <div>
                  <p className="font-semibold">{person.name}</p>
                  <p className="text-xs capitalize text-[var(--color-soil)]/70">
                    {person.status}
                  </p>
                </div>
                <div className="flex gap-1">
                  <Button size="sm" onClick={() => markAttendance(person.user_id, "attended")}>
                    Attended
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => markAttendance(person.user_id, "no_show")}
                  >
                    No-show
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </Modal>
    </AppShell>
  );
}
