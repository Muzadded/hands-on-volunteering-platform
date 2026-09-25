import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import api from "../api/client";
import AppShell from "../components/AppShell";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Select from "../components/ui/Select";
import Textarea from "../components/ui/Textarea";
import Alert from "../components/ui/Alert";
import { Skeleton } from "../components/ui/Spinner";
import { useToast } from "../components/ToastProvider";

export default function EditProfile({ setAuth }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    gender: "",
    dob: "",
    skills: "",
    causes: [],
    about: "",
    phone: "",
    notify_in_app: true,
    notify_email: true,
    notify_sms: false,
  });

  useEffect(() => {
    const load = async () => {
      try {
        const token = localStorage.getItem("token");
        const actorId = token ? jwtDecode(token).user : null;
        if (!actorId || String(actorId) !== String(id)) {
          setError("You can only edit your own profile.");
          setLoading(false);
          return;
        }

        const res = await api.get(`/users/${id}`);
        const user = res.data?.data?.user;
        if (!user) {
          setError("User not found");
          setLoading(false);
          return;
        }

        setFormData({
          name: user.name || "",
          email: user.email || "",
          gender: user.gender || "",
          dob: user.dob ? String(user.dob).slice(0, 10) : "",
          skills: Array.isArray(user.skills)
            ? user.skills.join(", ")
            : user.skills || "",
          causes: Array.isArray(user.causes) ? user.causes : [],
          about: user.about || "",
          phone: user.phone || "",
          notify_in_app: user.notify_in_app !== false,
          notify_email: user.notify_email !== false,
          notify_sms: Boolean(user.notify_sms),
        });
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load profile");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const skills = formData.skills
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
        .join(",");
      await api.patch(`/users/${id}`, {
        name: formData.name,
        gender: formData.gender,
        dob: formData.dob,
        skills,
        causes: formData.causes,
        about: formData.about,
      });
      await api.patch("/notifications/preferences", {
        phone: formData.phone || null,
        notify_in_app: formData.notify_in_app,
        notify_email: formData.notify_email,
        notify_sms: formData.notify_sms,
      });
      toast.success("Profile updated");
      navigate(`/dashboard/${id}`);
    } catch (err) {
      setError(err.response?.data?.message || "Update failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppShell setAuth={setAuth} title="Edit profile">
      {loading ? (
        <Skeleton className="h-80 w-full max-w-xl" />
      ) : error && !formData.name ? (
        <Alert tone="error">{error}</Alert>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="max-w-xl space-y-4 rounded-3xl bg-white/95 p-6 shadow-sm"
        >
          {error ? <Alert tone="error">{error}</Alert> : null}
          <Input
            id="edit-name"
            label="Name"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
          <Input id="edit-email" label="Email" value={formData.email} disabled />
          <Select
            id="edit-gender"
            label="Gender"
            value={formData.gender}
            onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
          >
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="non-binary">Non-binary</option>
            <option value="prefer-not-to-say">Prefer not to say</option>
            <option value="other">Other</option>
          </Select>
          <Input
            id="edit-dob"
            label="Date of birth"
            type="date"
            value={formData.dob}
            onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
          />
          <Input
            id="edit-skills"
            label="Skills (comma-separated)"
            value={formData.skills}
            onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
          />
          <Textarea
            id="edit-about"
            label="About"
            value={formData.about}
            onChange={(e) => setFormData({ ...formData, about: e.target.value })}
          />
          <Input
            id="edit-phone"
            label="Phone (for SMS)"
            placeholder="01XXXXXXXXX"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          />
          <fieldset className="space-y-2 rounded-2xl border border-[var(--color-mist)] p-4">
            <legend className="px-1 text-sm font-semibold text-[var(--color-teal-deep)]">
              Notification preferences
            </legend>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={formData.notify_in_app}
                onChange={(e) =>
                  setFormData({ ...formData, notify_in_app: e.target.checked })
                }
              />
              In-app
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={formData.notify_email}
                onChange={(e) =>
                  setFormData({ ...formData, notify_email: e.target.checked })
                }
              />
              Email
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={formData.notify_sms}
                onChange={(e) =>
                  setFormData({ ...formData, notify_sms: e.target.checked })
                }
              />
              SMS
            </label>
          </fieldset>
          <div className="flex gap-2">
            <Button type="submit" loading={saving}>
              Save changes
            </Button>
            <Button type="button" variant="secondary" onClick={() => navigate(-1)}>
              Cancel
            </Button>
          </div>
        </form>
      )}
    </AppShell>
  );
}
