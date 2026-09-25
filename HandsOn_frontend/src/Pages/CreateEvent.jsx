import { useEffect, useState } from "react";
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
  const [orgs, setOrgs] = useState([]);
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
    organization_id: "",
    recurrence_rule: "",
    recurrence_count: "1",
    waiver_text: "",
    min_age: "",
    shift_role: "",
    shift_capacity: "",
  });

  useEffect(() => {
    api
      .get("/organizations/mine")
      .then((res) => setOrgs(res.data?.data || []))
      .catch(() => setOrgs([]));
  }, []);

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
        title: eventData.title,
        details: eventData.details,
        date: eventData.date,
        location: eventData.location,
        start_time: eventData.start_time,
        end_time: eventData.end_time,
        category: eventData.category,
        member_limit: eventData.member_limit,
        tags: eventData.tags
          ? eventData.tags.split(",").map((t) => t.trim()).filter(Boolean)
          : undefined,
        organization_id: eventData.organization_id
          ? Number(eventData.organization_id)
          : undefined,
        recurrence_rule: eventData.recurrence_rule || undefined,
        recurrence_count: eventData.recurrence_rule
          ? Number(eventData.recurrence_count || 1)
          : undefined,
        waiver_text: eventData.waiver_text || undefined,
        min_age: eventData.min_age ? Number(eventData.min_age) : undefined,
      };
      if (eventData.shift_role && eventData.shift_capacity) {
        payload.shifts = [
          {
            role_name: eventData.shift_role,
            capacity: Number(eventData.shift_capacity),
            start_time: eventData.start_time,
            end_time: eventData.end_time,
          },
        ];
      }
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
          <Input id="location" name="location" label="Location" required value={eventData.location} onChange={onChange} />
          <Input id="start_time" name="start_time" type="time" label="Start time" required value={eventData.start_time} onChange={onChange} />
          <Input id="end_time" name="end_time" type="time" label="End time" required value={eventData.end_time} onChange={onChange} />
        </div>
        <Select id="category" name="category" label="Category" required value={eventData.category} onChange={onChange}>
          <option value="">Select category</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </Select>
        <Input id="member_limit" name="member_limit" type="number" min="1" label="Member limit" required value={eventData.member_limit} onChange={onChange} />
        <Select id="organization_id" name="organization_id" label="Organization (optional)" value={eventData.organization_id} onChange={onChange}>
          <option value="">Personal (no organization)</option>
          {orgs.map((org) => (
            <option key={org.id} value={org.id}>
              {org.name}
              {org.verified_at ? " ✓" : ""}
            </option>
          ))}
        </Select>
        <div className="grid gap-4 sm:grid-cols-2">
          <Select id="recurrence_rule" name="recurrence_rule" label="Recurrence" value={eventData.recurrence_rule} onChange={onChange}>
            <option value="">One-time</option>
            <option value="weekly">Weekly series</option>
          </Select>
          <Input id="recurrence_count" name="recurrence_count" type="number" min="1" max="12" label="Occurrences" value={eventData.recurrence_count} onChange={onChange} disabled={!eventData.recurrence_rule} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input id="shift_role" name="shift_role" label="Optional shift role" placeholder="Driver" value={eventData.shift_role} onChange={onChange} />
          <Input id="shift_capacity" name="shift_capacity" type="number" min="1" label="Shift capacity" value={eventData.shift_capacity} onChange={onChange} />
        </div>
        <Input id="min_age" name="min_age" type="number" min="1" label="Minimum age (optional)" value={eventData.min_age} onChange={onChange} />
        <Textarea id="waiver_text" name="waiver_text" label="Waiver text (optional)" value={eventData.waiver_text} onChange={onChange} />
        <Input id="tags" name="tags" label="Tags (comma-separated, optional)" placeholder="education, mentoring" value={eventData.tags || ""} onChange={onChange} />
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
