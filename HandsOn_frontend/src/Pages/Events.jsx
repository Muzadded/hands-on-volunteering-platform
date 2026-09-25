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
import Textarea from "../components/ui/Textarea";
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
  const [messageEventId, setMessageEventId] = useState(null);
  const [messageForm, setMessageForm] = useState({
    subject: "",
    body: "",
    channel: "all",
    template_id: "",
  });
  const [templates, setTemplates] = useState([]);
  const [sendingMessage, setSendingMessage] = useState(false);
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
        api.get("/events", { params: { upcoming: true } }),
        api.get("/events/recommended"),
      ]);
      const eventsData = eventsRes.data?.data;
      setEvents(
        Array.isArray(eventsData) ? eventsData : eventsData?.items || []
      );
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
      const body = {
        join_date: new Date().toISOString().slice(0, 10),
      };
      const guests = window.prompt("Bring guests? Enter number (0 for none):", "0");
      if (guests != null && guests !== "") {
        body.guest_count = Math.max(0, Number(guests) || 0);
      }
      if (event.waiver_text) {
        const signature = window.prompt(
          "Type your full name to sign the event waiver:"
        );
        if (!signature) {
          toast.error("Waiver signature required");
          return;
        }
        body.waiver_signature = signature;
      }
      const res = await api.post(`/events/${event.id}/join`, body);
      toast.success(
        res.data?.data?.waitlisted ? "Added to waitlist" : "Joined event"
      );
      await load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to join event");
    } finally {
      setJoiningId(null);
    }
  };

  const withdraw = async (eventId) => {
    try {
      await api.post(`/events/${eventId}/withdraw`);
      toast.success("Withdrawn from event");
      await load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to withdraw");
    }
  };

  const cancelEvent = async (eventId) => {
    const reason = window.prompt("Cancellation reason (optional):") ?? "";
    try {
      await api.post(`/events/${eventId}/cancel`, { reason });
      toast.success("Event cancelled");
      await load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to cancel event");
    }
  };

  const copyShareLink = async (event) => {
    try {
      const res = await api.get(`/events/${event.id}`);
      const slug = res.data?.data?.share_slug;
      if (!slug) {
        toast.error("Share link unavailable");
        return;
      }
      const url = `${window.location.origin}/events/share/${slug}`;
      await navigator.clipboard.writeText(url);
      toast.success("Share link copied");
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not copy share link");
    }
  };

  const downloadIcs = async (eventId) => {
    try {
      const res = await api.get(`/events/${eventId}/ics`, {
        responseType: "blob",
      });
      const url = URL.createObjectURL(res.data);
      const a = document.createElement("a");
      a.href = url;
      a.download = `handson-event-${eventId}.ics`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not download calendar file");
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

  const openMessage = async (eventId) => {
    setMessageEventId(eventId);
    setMessageForm({ subject: "", body: "", channel: "all", template_id: "" });
    try {
      const res = await api.get("/notifications/templates");
      setTemplates(res.data?.data || []);
    } catch {
      setTemplates([]);
    }
  };

  const applyTemplate = (templateId) => {
    const template = templates.find((t) => String(t.id) === String(templateId));
    setMessageForm((prev) => ({
      ...prev,
      template_id: templateId,
      subject: template?.subject || prev.subject,
      body: template?.body || prev.body,
      channel: template?.channel && template.channel !== "all" ? template.channel : prev.channel,
    }));
  };

  const sendBulkMessage = async (e) => {
    e.preventDefault();
    if (!messageEventId) return;
    setSendingMessage(true);
    try {
      const payload = {
        subject: messageForm.subject || undefined,
        body: messageForm.body,
        channel: messageForm.channel,
      };
      if (messageForm.template_id) {
        payload.template_id = Number(messageForm.template_id);
      }
      const res = await api.post(`/events/${messageEventId}/messages`, payload);
      toast.success(`Queued for ${res.data?.data?.queued ?? 0} registrants`);
      setMessageEventId(null);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to send message");
    } finally {
      setSendingMessage(false);
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
                  <>
                    <Badge tone="leaf">Joined</Badge>
                    <Button size="sm" variant="secondary" onClick={() => withdraw(event.id)}>
                      Withdraw
                    </Button>
                  </>
                ) : (
                  <Button
                    size="sm"
                    loading={joiningId === event.id}
                    onClick={() => join(event)}
                  >
                    Join event
                  </Button>
                )}
                <Button size="sm" variant="secondary" onClick={() => copyShareLink(event)}>
                  Share
                </Button>
                <Button size="sm" variant="secondary" onClick={() => downloadIcs(event.id)}>
                  Calendar
                </Button>
                {String(event.created_by) === String(currentUserId) ? (
                  <>
                    <Button size="sm" variant="secondary" onClick={() => openAttendance(event.id)}>
                      Attendance
                    </Button>
                    <Button size="sm" variant="secondary" onClick={() => openMessage(event.id)}>
                      Message
                    </Button>
                    <Button size="sm" variant="secondary" onClick={() => cancelEvent(event.id)}>
                      Cancel event
                    </Button>
                  </>
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

      <Modal
        open={Boolean(messageEventId)}
        title="Message registrants"
        onClose={() => setMessageEventId(null)}
      >
        <form onSubmit={sendBulkMessage} className="space-y-3">
          {templates.length > 0 ? (
            <Select
              id="message-template"
              label="Template (optional)"
              value={messageForm.template_id}
              onChange={(e) => applyTemplate(e.target.value)}
            >
              <option value="">Custom message</option>
              {templates.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </Select>
          ) : null}
          <Input
            id="message-subject"
            label="Subject"
            value={messageForm.subject}
            onChange={(e) => setMessageForm({ ...messageForm, subject: e.target.value })}
          />
          <Textarea
            id="message-body"
            label="Body"
            required
            value={messageForm.body}
            onChange={(e) => setMessageForm({ ...messageForm, body: e.target.value })}
          />
          <Select
            id="message-channel"
            label="Channel"
            value={messageForm.channel}
            onChange={(e) => setMessageForm({ ...messageForm, channel: e.target.value })}
          >
            <option value="all">In-app + email (+ SMS if enabled)</option>
            <option value="in_app">In-app only</option>
            <option value="email">Email only</option>
            <option value="sms">SMS only</option>
          </Select>
          <Button type="submit" loading={sendingMessage}>
            Send to registrants
          </Button>
        </form>
      </Modal>
    </AppShell>
  );
}
