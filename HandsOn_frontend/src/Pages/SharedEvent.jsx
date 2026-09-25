import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../api/client";
import Alert from "../components/ui/Alert";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import { Spinner } from "../components/ui/Spinner";

export default function SharedEvent() {
  const { slug } = useParams();
  const [event, setEvent] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/events/share/${slug}`);
        setEvent(res.data?.data || null);
      } catch (err) {
        setError(err.response?.data?.message || "Event not found");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [slug]);

  const downloadIcs = async () => {
    const res = await api.get(`/events/share/${slug}/ics`, { responseType: "blob" });
    const url = URL.createObjectURL(res.data);
    const a = document.createElement("a");
    a.href = url;
    a.download = `handson-event-${slug}.ics`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-[var(--color-mist)] px-4 py-10">
      <div className="mx-auto max-w-2xl rounded-3xl bg-white p-8 shadow-sm">
        <Link to="/" className="font-display text-2xl text-[var(--color-teal-deep)]">
          HandsOn
        </Link>
        {loading ? (
          <div className="mt-8">
            <Spinner label="Loading event" />
          </div>
        ) : error ? (
          <Alert tone="error" className="mt-6">
            {error}
          </Alert>
        ) : (
          <div className="mt-6 space-y-4">
            <div className="flex items-start justify-between gap-3">
              <h1 className="font-display text-3xl">{event.title}</h1>
              <Badge>{event.category}</Badge>
            </div>
            <p className="text-[var(--color-soil)]">{event.details}</p>
            <p className="text-sm text-[var(--color-soil)]/80">
              {event.location} ·{" "}
              {event.date ? new Date(event.date).toLocaleDateString() : "Flexible"}
            </p>
            <div className="flex flex-wrap gap-2">
              <Button onClick={downloadIcs}>Add to calendar</Button>
              <Link to="/login">
                <Button variant="secondary">Sign in to join</Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
