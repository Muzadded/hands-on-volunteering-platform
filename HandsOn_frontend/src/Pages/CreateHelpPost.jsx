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

export default function CreateHelpPost({ setAuth }) {
  const navigate = useNavigate();
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    details: "",
    location: "",
    urgency_level: "medium",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await api.post("/help-posts", formData);
      toast.success("Help post created");
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
        <Textarea
          id="help-details"
          label="What do you need help with?"
          required
          value={formData.details}
          onChange={(e) => setFormData({ ...formData, details: e.target.value })}
        />
        <Input
          id="help-location"
          label="Location"
          required
          value={formData.location}
          onChange={(e) => setFormData({ ...formData, location: e.target.value })}
        />
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
            Post request
          </Button>
          <Button type="button" variant="secondary" onClick={() => navigate("/help-request")}>
            Cancel
          </Button>
        </div>
      </form>
    </AppShell>
  );
}
