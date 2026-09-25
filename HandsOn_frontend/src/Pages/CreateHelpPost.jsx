import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/client";
import AppShell from "../components/AppShell";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Select from "../components/ui/Select";
import Textarea from "../components/ui/Textarea";
import Alert from "../components/ui/Alert";
import { useToast } from "../components/ToastProvider";
import { HELP_POST_CATEGORIES, HELP_POST_TYPES, isCrisisCategory, CRISIS_GUIDANCE } from "../constants/helpPosts";

export default function CreateHelpPost({ setAuth }) {
  const navigate = useNavigate();
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [locating, setLocating] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    details: "",
    location: "",
    urgency_level: "medium",
    post_type: "ask",
    category: "other",
    lat: "",
    lng: "",
  });

  const useMyLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported in this browser");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setFormData((prev) => ({
          ...prev,
          lat: String(pos.coords.latitude.toFixed(6)),
          lng: String(pos.coords.longitude.toFixed(6)),
        }));
        setLocating(false);
        toast.success("Location captured");
      },
      () => {
        setLocating(false);
        toast.error("Could not get your location");
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const payload = {
        ...formData,
        lat: formData.lat === "" ? null : Number(formData.lat),
        lng: formData.lng === "" ? null : Number(formData.lng),
      };
      await api.post("/help-posts", payload);
      toast.success(
        formData.post_type === "offer" ? "Help offer posted" : "Help request posted"
      );
      navigate("/help-request");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create help post");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppShell setAuth={setAuth} title="Create help post">
      <form
        onSubmit={handleSubmit}
        className="mx-auto max-w-xl space-y-4 rounded-3xl bg-white p-6 shadow-sm"
      >
        {error ? <Alert tone="error">{error}</Alert> : null}
        <Select
          id="help-post-type"
          label="Post type"
          value={formData.post_type}
          onChange={(e) => setFormData({ ...formData, post_type: e.target.value })}
        >
          {HELP_POST_TYPES.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </Select>
        <Input
          id="help-title"
          label="Title"
          required
          placeholder={
            formData.post_type === "offer"
              ? "e.g. Going to the bazar — anyone need anything?"
              : "e.g. Need a ride to the clinic"
          }
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
        />
        <Select
          id="help-category"
          label="Category"
          value={formData.category}
          onChange={(e) => setFormData({ ...formData, category: e.target.value })}
        >
          {HELP_POST_CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </Select>
        {isCrisisCategory(formData.category) ? (
          <Alert tone="error">{CRISIS_GUIDANCE}</Alert>
        ) : null}
        <Textarea
          id="help-details"
          label={
            formData.post_type === "offer"
              ? "What are you offering?"
              : "What do you need help with?"
          }
          required
          value={formData.details}
          onChange={(e) => setFormData({ ...formData, details: e.target.value })}
        />
        <Input
          id="help-location"
          label="Location / landmark"
          required
          value={formData.location}
          onChange={(e) => setFormData({ ...formData, location: e.target.value })}
        />
        <p className="text-xs text-[var(--color-soil)]/60">
          Exact address stays hidden from others until someone claims the post.
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          <Input
            id="help-lat"
            label="Latitude (optional)"
            value={formData.lat}
            onChange={(e) => setFormData({ ...formData, lat: e.target.value })}
          />
          <Input
            id="help-lng"
            label="Longitude (optional)"
            value={formData.lng}
            onChange={(e) => setFormData({ ...formData, lng: e.target.value })}
          />
        </div>
        <Button type="button" variant="secondary" size="sm" loading={locating} onClick={useMyLocation}>
          Use my location
        </Button>
        <Select
          id="help-urgency"
          label="Urgency"
          value={formData.urgency_level}
          onChange={(e) => setFormData({ ...formData, urgency_level: e.target.value })}
        >
          <option value="urgent">Urgent</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </Select>
        <div className="flex gap-2">
          <Button type="submit" loading={loading}>
            {formData.post_type === "offer" ? "Post offer" : "Post request"}
          </Button>
          <Button type="button" variant="secondary" onClick={() => navigate("/help-request")}>
            Cancel
          </Button>
        </div>
      </form>
    </AppShell>
  );
}
