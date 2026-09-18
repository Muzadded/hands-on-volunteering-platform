import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import api from "../api/client";
import AppShell from "../components/AppShell";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import EmptyState from "../components/ui/EmptyState";
import Textarea from "../components/ui/Textarea";
import Select from "../components/ui/Select";
import Alert from "../components/ui/Alert";
import { Spinner } from "../components/ui/Spinner";
import { useToast } from "../components/ToastProvider";

export default function HelpReq({ setAuth }) {
  const navigate = useNavigate();
  const toast = useToast();
  const [posts, setPosts] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [details, setDetails] = useState(null);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [posting, setPosting] = useState(false);
  const [statusFilter, setStatusFilter] = useState("");
  const [urgencyFilter, setUrgencyFilter] = useState("");
  const currentUserId = (() => {
    try {
      return jwtDecode(localStorage.getItem("token") || "").user;
    } catch {
      return null;
    }
  })();

  const loadPosts = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/help-posts", {
        params: {
          ...(statusFilter ? { status: statusFilter } : {}),
          ...(urgencyFilter ? { urgency: urgencyFilter } : {}),
        },
      });
      setPosts(res.data?.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load help posts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPosts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, urgencyFilter]);

  useEffect(() => {
    if (!selectedId) return;
    const loadDetails = async () => {
      try {
        const res = await api.get(`/help-posts/${selectedId}`);
        setDetails(res.data?.data || null);
      } catch (err) {
        toast.error(err.response?.data?.message || "Failed to load post");
      }
    };
    loadDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId]);

  const addComment = async () => {
    if (!comment.trim()) return;
    setPosting(true);
    try {
      await api.post(`/help-posts/${selectedId}/comments`, { comment });
      setComment("");
      toast.success("Comment added");
      const res = await api.get(`/help-posts/${selectedId}`);
      setDetails(res.data?.data || null);
      await loadPosts();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to comment");
    } finally {
      setPosting(false);
    }
  };

  const claim = async () => {
    try {
      await api.post(`/help-posts/${selectedId}/claim`);
      toast.success("Claimed help request");
      const res = await api.get(`/help-posts/${selectedId}`);
      setDetails(res.data?.data || null);
      await loadPosts();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to claim");
    }
  };

  const setStatus = async (status) => {
    try {
      await api.patch(`/help-posts/${selectedId}`, { status });
      toast.success(`Marked ${status}`);
      const res = await api.get(`/help-posts/${selectedId}`);
      setDetails(res.data?.data || null);
      await loadPosts();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update status");
    }
  };

  const urgencyTone = (level) => {
    if (level === "urgent") return "danger";
    if (level === "medium") return "warn";
    return "teal";
  };

  return (
    <AppShell
      setAuth={setAuth}
      title="Help requests"
      actions={
        <Button size="sm" onClick={() => navigate("/create-help-post")}>
          New request
        </Button>
      }
    >
      <div className="mb-4 grid gap-3 sm:grid-cols-2">
        <Select
          id="help-status-filter"
          label="Status"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">All statuses</option>
          <option value="open">Open</option>
          <option value="in_progress">In progress</option>
          <option value="resolved">Resolved</option>
        </Select>
        <Select
          id="help-urgency-filter"
          label="Urgency"
          value={urgencyFilter}
          onChange={(e) => setUrgencyFilter(e.target.value)}
        >
          <option value="">All urgency</option>
          <option value="urgent">Urgent</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </Select>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Spinner />
        </div>
      ) : error ? (
        <Alert tone="error">{error}</Alert>
      ) : posts.length === 0 ? (
        <EmptyState
          title="No help posts yet"
          description="Be the first to ask your community for support."
          actionLabel="Create help post"
          onAction={() => navigate("/create-help-post")}
        />
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-3">
            {posts.map((post) => (
              <button
                key={post.help_post_id}
                type="button"
                onClick={() => setSelectedId(post.help_post_id)}
                className={`w-full rounded-2xl bg-white p-4 text-left shadow-sm transition ${
                  selectedId === post.help_post_id ? "ring-2 ring-[var(--color-teal)]" : ""
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="font-semibold">{post.requester_name}</p>
                  <div className="flex gap-1">
                    <Badge tone={urgencyTone(post.urgency_level)}>{post.urgency_level}</Badge>
                    <Badge tone="muted">{post.status}</Badge>
                  </div>
                </div>
                <p className="mt-2 line-clamp-2 text-sm text-[var(--color-soil)]/80">
                  {post.details}
                </p>
              </button>
            ))}
          </div>

          <div className="rounded-2xl bg-white p-5 shadow-sm">
            {!selectedId ? (
              <p className="text-[var(--color-soil)]/70">Select a help request to view details.</p>
            ) : !details ? (
              <Spinner />
            ) : (
              <>
                <h3 className="font-display text-2xl">{details.post.requester_name}</h3>
                <p className="mt-2 text-[var(--color-soil)]">{details.post.details}</p>
                <p className="mt-3 text-sm text-[var(--color-soil)]/70">
                  {details.post.location}
                  {details.post.helper_name ? ` · Helper: ${details.post.helper_name}` : ""}
                </p>

                <div className="mt-4 flex flex-wrap gap-2">
                  {details.post.status === "open" &&
                  String(details.post.created_by) !== String(currentUserId) ? (
                    <Button size="sm" onClick={claim}>
                      Claim this request
                    </Button>
                  ) : null}
                  {(String(details.post.created_by) === String(currentUserId) ||
                    String(details.post.claimed_by) === String(currentUserId)) &&
                  details.post.status !== "resolved" ? (
                    <Button size="sm" variant="secondary" onClick={() => setStatus("resolved")}>
                      Mark resolved
                    </Button>
                  ) : null}
                  {String(details.post.created_by) === String(currentUserId) &&
                  details.post.status !== "open" ? (
                    <Button size="sm" variant="ghost" onClick={() => setStatus("open")}>
                      Reopen
                    </Button>
                  ) : null}
                </div>

                <div className="mt-6 space-y-3">
                  <h4 className="font-semibold">Comments</h4>
                  {(details.comments || []).length === 0 ? (
                    <p className="text-sm text-[var(--color-soil)]/60">No comments yet.</p>
                  ) : (
                    details.comments.map((c) => (
                      <div key={c.comment_id} className="rounded-xl bg-[var(--color-mist)] p-3">
                        <p className="text-sm font-semibold">{c.commenter_name}</p>
                        <p className="text-sm text-[var(--color-soil)]">{c.comment}</p>
                      </div>
                    ))
                  )}
                </div>

                <div className="mt-4 space-y-3">
                  <Textarea
                    id="help-comment"
                    label="Add a comment"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                  />
                  <Button onClick={addComment} loading={posting}>
                    Post comment
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </AppShell>
  );
}
