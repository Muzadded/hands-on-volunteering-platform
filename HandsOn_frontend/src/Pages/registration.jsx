import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/client";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Select from "../components/ui/Select";
import Textarea from "../components/ui/Textarea";
import Alert from "../components/ui/Alert";
import { useToast } from "../components/ToastProvider";

const CAUSE_OPTIONS = [
  "education",
  "environment",
  "healthcare",
  "community",
  "animal welfare",
  "disaster relief",
];

export default function Registration() {
  const navigate = useNavigate();
  const toast = useToast();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    gender: "",
    dob: "",
    email: "",
    password: "",
    password_confirmation: "",
    about: "",
    skills: "",
    causes: [],
  });

  const toggleCause = (cause) => {
    setFormData((prev) => ({
      ...prev,
      causes: prev.causes.includes(cause)
        ? prev.causes.filter((c) => c !== cause)
        : [...prev.causes, cause],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.password_confirmation) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const res = await api.post("/auth/register", formData);
      if (res.data.status === "success") {
        toast.success("Registration successful. Please login.");
        navigate("/login");
      } else {
        setError(res.data.message || "Registration failed");
      }
    } catch (err) {
      setError(
        typeof err.response?.data === "string"
          ? err.response.data
          : err.response?.data?.message || "Registration failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen px-4 py-12 sm:px-6">
      <div className="mx-auto max-w-xl rounded-3xl bg-white/95 p-8 shadow-xl fade-up">
        <Link to="/" className="font-display text-3xl text-[var(--color-teal-deep)]">
          HandsOn
        </Link>
        <h1 className="mt-4 font-display text-3xl text-[var(--color-ink)]">
          Create your account
        </h1>
        <p className="mt-2 text-[var(--color-soil)]/80">
          Tell us a little about yourself so we can match better opportunities later.
        </p>

        {error ? (
          <Alert tone="error" className="mt-5">
            {error}
          </Alert>
        ) : null}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <Input
            id="reg-name"
            label="Full name"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <Select
              id="reg-gender"
              label="Gender"
              required
              value={formData.gender}
              onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
            >
              <option value="">Select</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="non-binary">Non-binary</option>
              <option value="prefer-not-to-say">Prefer not to say</option>
            </Select>
            <Input
              id="reg-dob"
              label="Date of birth"
              type="date"
              required
              value={formData.dob}
              onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
            />
          </div>
          <Input
            id="reg-email"
            label="Email"
            type="email"
            required
            autoComplete="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
          <Input
            id="reg-password"
            label="Password"
            type="password"
            required
            autoComplete="new-password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          />
          <Input
            id="reg-password-confirm"
            label="Confirm password"
            type="password"
            required
            autoComplete="new-password"
            value={formData.password_confirmation}
            onChange={(e) =>
              setFormData({ ...formData, password_confirmation: e.target.value })
            }
          />
          <Textarea
            id="reg-about"
            label="About"
            value={formData.about}
            onChange={(e) => setFormData({ ...formData, about: e.target.value })}
          />
          <Input
            id="reg-skills"
            label="Skills (comma-separated)"
            value={formData.skills}
            onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
          />
          <fieldset>
            <legend className="mb-2 text-sm font-semibold text-[var(--color-soil)]">
              Causes you care about
            </legend>
            <div className="flex flex-wrap gap-2">
              {CAUSE_OPTIONS.map((cause) => {
                const active = formData.causes.includes(cause);
                return (
                  <button
                    key={cause}
                    type="button"
                    onClick={() => toggleCause(cause)}
                    className={`rounded-lg px-3 py-1.5 text-sm font-semibold capitalize ${
                      active
                        ? "bg-[var(--color-teal)] text-white"
                        : "bg-[var(--color-mist)] text-[var(--color-soil)]"
                    }`}
                  >
                    {cause}
                  </button>
                );
              })}
            </div>
          </fieldset>

          <Button type="submit" className="w-full" loading={loading}>
            Create account
          </Button>
        </form>

        <p className="mt-6 text-center text-sm">
          Already registered?{" "}
          <Link to="/login" className="font-semibold text-[var(--color-teal-deep)]">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
