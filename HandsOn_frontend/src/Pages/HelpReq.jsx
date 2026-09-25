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
import Input from "../components/ui/Input";
import Alert from "../components/ui/Alert";
import Modal from "../components/ui/Modal";
import { Spinner } from "../components/ui/Spinner";
import { useToast } from "../components/ToastProvider";
import HelpMap from "../components/HelpMap";
import {
  HELP_POST_CATEGORIES,
  HELP_POST_TYPES,
  categoryLabel,
  postTypeLabel,
  isCrisisCategory,
  CRISIS_GUIDANCE,
} from "../constants/helpPosts";

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
  const [typeFilter, setTypeFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [viewerLat, setViewerLat] = useState(null);
  const [viewerLng, setViewerLng] = useState(null);
  const [myInvites, setMyInvites] = useState([]);
  const [nearbyHelpers, setNearbyHelpers] = useState([]);
  const [loadingHelpers, setLoadingHelpers] = useState(false);
  const [sharedContact, setSharedContact] = useState(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [reportOpen, setReportOpen] = useState(false);
  const [reportReason, setReportReason] = useState("spam");
  const [reportDetails, setReportDetails] = useState("");
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
          ...(typeFilter ? { post_type: typeFilter } : {}),
          ...(categoryFilter ? { category: categoryFilter } : {}),
          ...(viewerLat != null && viewerLng != null
            ? { lat: viewerLat, lng: viewerLng, radius_km: 25 }
            : {}),
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
  }, [statusFilter, urgencyFilter, typeFilter, categoryFilter, viewerLat, viewerLng]);

  const enableNearby = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        setViewerLat(pos.coords.latitude);
        setViewerLng(pos.coords.longitude);
        setShowMap(true);
        try {
          await api.patch("/users/me/location", {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          });
        } catch {
          /* non-blocking */
        }
        toast.success("Showing posts near you");
      },
      () => toast.error("Could not get your location")
    );
  };

  const loadMyInvites = async () => {
    try {
      const res = await api.get("/help-posts/invites/mine", {
        params: { status: "pending" },
      });
      setMyInvites(res.data?.data || []);
    } catch {
      /* ignore */
    }
  };

  useEffect(() => {
    loadMyInvites();
  }, []);

  const respondInvite = async (inviteId, status) => {
    try {
      const res = await api.post(`/help-posts/invites/${inviteId}/respond`, {
        status,
        meeting_time: status === "accepted" ? new Date(Date.now() + 3600000).toISOString() : null,
      });
      toast.success(status === "accepted" ? "Invite accepted" : "Invite declined");
      if (status === "accepted") {
        setSharedContact(res.data?.data?.shared_contact || null);
        setSelectedId(res.data?.data?.post?.help_post_id || null);
      }
      await loadMyInvites();
      await loadPosts();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to respond");
    }
  };

  const loadNearbyHelpers = async () => {
    if (!selectedId) return;
    setLoadingHelpers(true);
    try {
      const res = await api.get(`/help-posts/${selectedId}/nearby-helpers`, {
        params: { radius_km: 15 },
      });
      setNearbyHelpers(res.data?.data || []);
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not load nearby helpers");
      setNearbyHelpers([]);
    } finally {
      setLoadingHelpers(false);
    }
  };

  const inviteOne = async (userId) => {
    try {
      await api.post(`/help-posts/${selectedId}/invites`, { user_ids: [userId] });
      toast.success("Invite sent");
      setNearbyHelpers((list) => list.filter((h) => h.user_id !== userId));
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to invite");
    }
  };

  const submitReview = async () => {
    try {
      await api.post(`/help-posts/${selectedId}/reviews`, {
        rating: Number(reviewRating),
        comment: reviewComment || null,
      });
      toast.success("Review submitted");
      setReviewComment("");
      const res = await api.get(`/help-posts/${selectedId}`);
      setDetails(res.data?.data || null);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to submit review");
    }
  };

  const submitReport = async () => {
    try {
      await api.post("/help-posts/reports", {
        target_type: "help_post",
        target_id: selectedId,
        reason: reportReason,
        details: reportDetails || null,
      });
      toast.success("Report submitted for review");
      setReportOpen(false);
      setReportDetails("");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to report");
    }
  };

  useEffect(() => {
    if (!selectedId) return;
    setEditing(false);
    setNearbyHelpers([]);
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

  const startEdit = () => {
    if (!details?.post) return;
    setEditForm({
      title: details.post.title || "",
      details: details.post.details || "",
      location: details.post.location || "",
      urgency_level: details.post.urgency_level || "medium",
      post_type: details.post.post_type || "ask",
      category: details.post.category || "other",
    });
    setEditing(true);
  };

  const saveEdit = async () => {
    setSaving(true);
    try {
      await api.patch(`/help-posts/${selectedId}`, editForm);
      toast.success("Post updated");
      setEditing(false);
      const res = await api.get(`/help-posts/${selectedId}`);
      setDetails(res.data?.data || null);
      await loadPosts();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update");
    } finally {
      setSaving(false);
    }
  };

  const removePost = async () => {
    try {
      await api.delete(`/help-posts/${selectedId}`);
      toast.success("Post deleted");
      setConfirmDelete(false);
      setSelectedId(null);
      setDetails(null);
      await loadPosts();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete");
    }
  };

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

  const isOwner =
    details?.post && String(details.post.created_by) === String(currentUserId);

  return (
    <AppShell
      setAuth={setAuth}
      title="Neighbour help"
      actions={
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="secondary" onClick={() => setShowMap((v) => !v)}>
            {showMap ? "Hide map" : "Map view"}
          </Button>
          <Button size="sm" variant="ghost" onClick={enableNearby}>
            Near me
          </Button>
          <Button size="sm" onClick={() => navigate("/create-help-post")}>
            New post
          </Button>
        </div>
      }
    >
      {showMap ? (
        <div className="mb-4">
          <HelpMap
            posts={posts}
            selectedId={selectedId}
            onSelect={setSelectedId}
            center={
              viewerLat != null && viewerLng != null
                ? [viewerLat, viewerLng]
                : undefined
            }
          />
          <p className="mt-2 text-xs text-[var(--color-soil)]/60">
            Markers use approximate coordinates until you claim a post.
          </p>
        </div>
      ) : null}

      {myInvites.length > 0 ? (
        <div className="mb-4 space-y-2 rounded-2xl border border-[var(--color-teal)]/30 bg-white p-4 shadow-sm">
          <h3 className="font-semibold">Pending invites</h3>
          {myInvites.map((inv) => (
            <div
              key={inv.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-[var(--color-mist)] p-3"
            >
              <div>
                <p className="text-sm font-semibold">{inv.title}</p>
                <p className="text-xs text-[var(--color-soil)]/70">
                  from {inv.owner_name} · {categoryLabel(inv.category)}
                </p>
              </div>
              <div className="flex gap-2">
                <Button size="sm" onClick={() => respondInvite(inv.id, "accepted")}>
                  Accept
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => respondInvite(inv.id, "declined")}
                >
                  Decline
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : null}

      {sharedContact ? (
        <Alert tone="success" className="mb-4">
          Contact shared — requester: {sharedContact.requester?.name}
          {sharedContact.requester?.phone ? ` (${sharedContact.requester.phone})` : ""}
          {sharedContact.meeting_time
            ? ` · meet ${new Date(sharedContact.meeting_time).toLocaleString()}`
            : ""}
        </Alert>
      ) : null}

      <div className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Select
          id="help-type-filter"
          label="Type"
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
        >
          <option value="">All types</option>
          {HELP_POST_TYPES.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </Select>
        <Select
          id="help-category-filter"
          label="Category"
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
        >
          <option value="">All categories</option>
          {HELP_POST_CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </Select>
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
          description="Ask for help or offer to help a neighbour."
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
                  <p className="font-semibold line-clamp-1">
                    {post.title || post.requester_name}
                  </p>
                  <div className="flex flex-wrap justify-end gap-1">
                    <Badge tone={post.post_type === "offer" ? "teal" : "muted"}>
                      {postTypeLabel(post.post_type)}
                    </Badge>
                    <Badge tone={urgencyTone(post.urgency_level)}>{post.urgency_level}</Badge>
                    <Badge tone="muted">{post.status}</Badge>
                  </div>
                </div>
                <p className="mt-1 text-xs text-[var(--color-soil)]/60">
                  {categoryLabel(post.category)} · {post.requester_name}
                </p>
                <p className="mt-2 line-clamp-2 text-sm text-[var(--color-soil)]/80">
                  {post.details}
                </p>
              </button>
            ))}
          </div>

          <div className="rounded-2xl bg-white p-5 shadow-sm">
            {!selectedId ? (
              <p className="text-[var(--color-soil)]/70">Select a help post to view details.</p>
            ) : !details ? (
              <Spinner />
            ) : editing && editForm ? (
              <div className="space-y-3">
                <h3 className="font-display text-xl">Edit post</h3>
                <Select
                  id="edit-post-type"
                  label="Type"
                  value={editForm.post_type}
                  onChange={(e) => setEditForm({ ...editForm, post_type: e.target.value })}
                >
                  {HELP_POST_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </Select>
                <Input
                  id="edit-title"
                  label="Title"
                  value={editForm.title}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                />
                <Select
                  id="edit-category"
                  label="Category"
                  value={editForm.category}
                  onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                >
                  {HELP_POST_CATEGORIES.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </Select>
                <Textarea
                  id="edit-details"
                  label="Details"
                  value={editForm.details}
                  onChange={(e) => setEditForm({ ...editForm, details: e.target.value })}
                />
                <Input
                  id="edit-location"
                  label="Location"
                  value={editForm.location}
                  onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                />
                <Select
                  id="edit-urgency"
                  label="Urgency"
                  value={editForm.urgency_level}
                  onChange={(e) =>
                    setEditForm({ ...editForm, urgency_level: e.target.value })
                  }
                >
                  <option value="urgent">Urgent</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </Select>
                <div className="flex gap-2">
                  <Button onClick={saveEdit} loading={saving}>
                    Save
                  </Button>
                  <Button variant="secondary" onClick={() => setEditing(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex flex-wrap gap-1">
                  <Badge tone={details.post.post_type === "offer" ? "teal" : "muted"}>
                    {postTypeLabel(details.post.post_type)}
                  </Badge>
                  <Badge tone="muted">{categoryLabel(details.post.category)}</Badge>
                  <Badge tone={urgencyTone(details.post.urgency_level)}>
                    {details.post.urgency_level}
                  </Badge>
                  <Badge tone="muted">{details.post.status}</Badge>
                </div>
                <h3 className="mt-3 font-display text-2xl">
                  {details.post.title || details.post.requester_name}
                </h3>
                <p className="mt-1 text-sm text-[var(--color-soil)]/70">
                  by {details.post.requester_name}
                </p>
                {isCrisisCategory(details.post.category) ? (
                  <div className="mt-3">
                    <Alert tone="error">{CRISIS_GUIDANCE}</Alert>
                  </div>
                ) : null}
                <p className="mt-2 text-[var(--color-soil)]">{details.post.details}</p>
                <p className="mt-3 text-sm text-[var(--color-soil)]/70">
                  {details.post.location}
                  {details.post.helper_name ? ` · Helper: ${details.post.helper_name}` : ""}
                </p>
                {details.post.location_hidden ? (
                  <Alert tone="info">
                    Exact address is hidden until this post is claimed.
                  </Alert>
                ) : null}

                <div className="mt-4 flex flex-wrap gap-2">
                  {details.post.status === "open" &&
                  String(details.post.created_by) !== String(currentUserId) ? (
                    <Button size="sm" onClick={claim}>
                      {details.post.post_type === "offer"
                        ? "Accept this offer"
                        : "Claim this request"}
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
                  {isOwner ? (
                    <>
                      <Button size="sm" variant="secondary" onClick={startEdit}>
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setConfirmDelete(true)}
                      >
                        Delete
                      </Button>
                      {details.post.status === "open" &&
                      details.post.lat != null &&
                      details.post.lng != null ? (
                        <Button
                          size="sm"
                          variant="secondary"
                          loading={loadingHelpers}
                          onClick={loadNearbyHelpers}
                        >
                          Invite nearby
                        </Button>
                      ) : null}
                    </>
                  ) : null}
                  {!isOwner ? (
                    <Button size="sm" variant="ghost" onClick={() => setReportOpen(true)}>
                      Report
                    </Button>
                  ) : null}
                </div>

                {isOwner && nearbyHelpers.length > 0 ? (
                  <div className="mt-4 space-y-2 rounded-xl bg-[var(--color-mist)] p-3">
                    <p className="text-sm font-semibold">Nearby helpers</p>
                    {nearbyHelpers.slice(0, 8).map((h) => (
                      <div
                        key={h.user_id}
                        className="flex items-center justify-between gap-2 text-sm"
                      >
                        <span>
                          {h.name} · {h.distance_km} km
                        </span>
                        <Button size="sm" onClick={() => inviteOne(h.user_id)}>
                          Invite
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : null}

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

                {(details.reviews || []).length > 0 ? (
                  <div className="mt-6 space-y-2">
                    <h4 className="font-semibold">Reviews</h4>
                    {details.reviews.map((r) => (
                      <div key={r.id} className="rounded-xl bg-[var(--color-mist)] p-3 text-sm">
                        <p className="font-semibold">
                          {r.reviewer_name} · {r.rating}/5
                        </p>
                        {r.comment ? <p className="text-[var(--color-soil)]">{r.comment}</p> : null}
                      </div>
                    ))}
                  </div>
                ) : null}

                {details.post.status === "resolved" &&
                (String(details.post.created_by) === String(currentUserId) ||
                  String(details.post.claimed_by) === String(currentUserId)) &&
                !(details.reviews || []).some(
                  (r) => String(r.reviewer_id) === String(currentUserId)
                ) ? (
                  <div className="mt-6 space-y-3 rounded-xl border border-[var(--color-mist)] p-3">
                    <h4 className="font-semibold">Leave a review</h4>
                    <Select
                      id="review-rating"
                      label="Rating"
                      value={reviewRating}
                      onChange={(e) => setReviewRating(e.target.value)}
                    >
                      {[5, 4, 3, 2, 1].map((n) => (
                        <option key={n} value={n}>
                          {n}
                        </option>
                      ))}
                    </Select>
                    <Textarea
                      id="review-comment"
                      label="Comment (optional)"
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                    />
                    <Button size="sm" onClick={submitReview}>
                      Submit review
                    </Button>
                  </div>
                ) : null}
              </>
            )}
          </div>
        </div>
      )}

      <Modal
        open={reportOpen}
        title="Report this post"
        onClose={() => setReportOpen(false)}
        actions={
          <>
            <Button variant="secondary" onClick={() => setReportOpen(false)}>
              Cancel
            </Button>
            <Button onClick={submitReport}>Submit report</Button>
          </>
        }
      >
        <div className="space-y-3">
          <Select
            id="report-reason"
            label="Reason"
            value={reportReason}
            onChange={(e) => setReportReason(e.target.value)}
          >
            <option value="spam">Spam</option>
            <option value="harassment">Harassment</option>
            <option value="misleading">Misleading / scam</option>
            <option value="unsafe">Unsafe content</option>
            <option value="other">Other</option>
          </Select>
          <Textarea
            id="report-details"
            label="Details (optional)"
            value={reportDetails}
            onChange={(e) => setReportDetails(e.target.value)}
          />
        </div>
      </Modal>

      <Modal
        open={confirmDelete}
        title="Delete help post?"
        onClose={() => setConfirmDelete(false)}
        actions={
          <>
            <Button variant="secondary" onClick={() => setConfirmDelete(false)}>
              Cancel
            </Button>
            <Button onClick={removePost}>Delete</Button>
          </>
        }
      >
        <p className="text-sm text-[var(--color-soil)]/80">
          This permanently removes the post and its comments.
        </p>
      </Modal>
    </AppShell>
  );
}
