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

const CATEGORIES = [
  "Education",
  "Environment",
  "Social Activity",
  "Healthcare",
  "Animal Welfare",
  "Community Development",
  "Elderly Care",
  "Youth Empowerment",
  "Disaster Relief",
  "Arts & Culture",
  "Food Security",
  "Sports",
  "Other",
];

export default function CreateEvent({ setAuth }) {
  const navigate = useNavigate();
  const toast = useToast();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [eventData, setEventData] = useState({
    title: "",
    details: "",
    date: "",
    location: "",
    start_time: "",
    end_time: "",
    category: "",
    member_limit: "",
    tags: "",
  });

  const onChange = (e) => {
    const { name, value } = e.target;
    setEventData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const payload = {
        ...eventData,
        tags: eventData.tags
          ? eventData.tags.split(",").map((t) => t.trim()).filter(Boolean)
          : undefined,
      };
      const res = await api.post("/events", payload);
      if (res.data.status === "success") {
        toast.success("Event created");
        navigate("/events-feed");
      } else {
        setError(res.data.message || "Event creation failed");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create event");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppShell setAuth={setAuth} title="Create event">
      <form
        onSubmit={handleSubmit}
        className="mx-auto max-w-2xl space-y-4 rounded-3xl bg-white p-6 shadow-sm"
      >
        {error ? <Alert tone="error">{error}</Alert> : null}
        <Input id="title" name="title" label="Title" required value={eventData.title} onChange={onChange} />
        <Textarea
          id="details"
          name="details"
          label="Details"
          required
          value={eventData.details}
          onChange={onChange}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <Input id="date" name="date" type="date" label="Date" required value={eventData.date} onChange={onChange} />
          <Input
            id="location"
            name="location"
            label="Location"
            required
            value={eventData.location}
            onChange={onChange}
          />
          <Input
            id="start_time"
            name="start_time"
            type="time"
            label="Start time"
            required
            value={eventData.start_time}
            onChange={onChange}
          />
          <Input
            id="end_time"
            name="end_time"
            type="time"
            label="End time"
            required
            value={eventData.end_time}
            onChange={onChange}
          />
        </div>
        <Select
          id="category"
          name="category"
          label="Category"
          required
          value={eventData.category}
          onChange={onChange}
        >
          <option value="">Select category</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </Select>
        <Input
          id="member_limit"
          name="member_limit"
          type="number"
          min="1"
          label="Member limit"
          required
          value={eventData.member_limit}
          onChange={onChange}
        />
        <Input
          id="tags"
          name="tags"
          label="Tags (comma-separated, optional)"
          placeholder="education, mentoring"
          value={eventData.tags || ""}
          onChange={onChange}
        />
        <div className="flex gap-2">
          <Button type="submit" loading={loading}>
            Create event
          </Button>
          <Button type="button" variant="secondary" onClick={() => navigate("/events-feed")}>
            Cancel
          </Button>
        </div>
      </form>
    </AppShell>
  );
}
