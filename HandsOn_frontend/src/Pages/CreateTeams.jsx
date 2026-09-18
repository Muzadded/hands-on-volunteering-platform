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
  "Other",
];

export default function CreateTeams({ setAuth }) {
  const navigate = useNavigate();
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
    isPrivate: false,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await api.post("/teams", formData);
      toast.success("Team created");
      navigate("/teams");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create team");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppShell setAuth={setAuth} title="Create team">
      <form
        onSubmit={handleSubmit}
        className="mx-auto max-w-xl space-y-4 rounded-3xl bg-white p-6 shadow-sm"
      >
        {error ? <Alert tone="error">{error}</Alert> : null}
        <Input
          id="team-name"
          label="Team name"
          required
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        />
        <Textarea
          id="team-description"
          label="Description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        />
        <Select
          id="team-category"
          label="Category"
          required
          value={formData.category}
          onChange={(e) => setFormData({ ...formData, category: e.target.value })}
        >
          <option value="">Select category</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </Select>
        <label className="flex items-center gap-2 text-sm font-semibold text-[var(--color-soil)]">
          <input
            id="team-private"
            type="checkbox"
            checked={formData.isPrivate}
            onChange={(e) => setFormData({ ...formData, isPrivate: e.target.checked })}
          />
          Private team
        </label>
        <div className="flex gap-2">
          <Button type="submit" loading={loading}>
            Create team
          </Button>
          <Button type="button" variant="secondary" onClick={() => navigate("/teams")}>
            Cancel
          </Button>
        </div>
      </form>
    </AppShell>
  );
}
