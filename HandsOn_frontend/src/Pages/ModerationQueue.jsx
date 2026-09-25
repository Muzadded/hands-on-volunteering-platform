import { useEffect, useState } from "react";
import api from "../api/client";
import AppShell from "../components/AppShell";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import Select from "../components/ui/Select";
import Alert from "../components/ui/Alert";
import EmptyState from "../components/ui/EmptyState";
import { Spinner } from "../components/ui/Spinner";
import { useToast } from "../components/ToastProvider";

export default function ModerationQueue({ setAuth }) {
  const toast = useToast();
  const [reports, setReports] = useState([]);
  const [status, setStatus] = useState("open");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/help-posts/moderation/reports", {
        params: status ? { status } : {},
      });
      setReports(res.data?.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load reports");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  const resolve = async (id, nextStatus) => {
    try {
      await api.patch(`/help-posts/moderation/reports/${id}`, {
        status: nextStatus,
        resolution_note: nextStatus === "resolved" ? "Reviewed by admin" : "Dismissed",
      });
      toast.success(`Report ${nextStatus}`);
      await load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update report");
    }
  };

  return (
    <AppShell setAuth={setAuth} title="Moderation">
      <div className="mb-4 max-w-xs">
        <Select
          id="report-status"
          label="Status"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="open">Open</option>
          <option value="resolved">Resolved</option>
          <option value="dismissed">Dismissed</option>
          <option value="">All</option>
        </Select>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Spinner />
        </div>
      ) : error ? (
        <Alert tone="error">{error}</Alert>
      ) : reports.length === 0 ? (
        <EmptyState title="No reports" description="Moderation queue is clear." />
      ) : (
        <div className="space-y-3">
          {reports.map((r) => (
            <div key={r.id} className="rounded-2xl bg-white p-4 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex gap-2">
                  <Badge tone="muted">{r.target_type}</Badge>
                  <Badge tone={r.status === "open" ? "warn" : "muted"}>{r.status}</Badge>
                </div>
                <p className="text-xs text-[var(--color-soil)]/60">
                  by {r.reporter_name} · #{r.target_id}
                </p>
              </div>
              <p className="mt-2 font-semibold">{r.reason}</p>
              {r.details ? (
                <p className="mt-1 text-sm text-[var(--color-soil)]/80">{r.details}</p>
              ) : null}
              {r.status === "open" ? (
                <div className="mt-3 flex gap-2">
                  <Button size="sm" onClick={() => resolve(r.id, "resolved")}>
                    Resolve
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => resolve(r.id, "dismissed")}>
                    Dismiss
                  </Button>
                </div>
              ) : null}
            </div>
          ))}
        </div>
      )}
    </AppShell>
  );
}
