import { useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import api from "../api/client";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Alert from "../components/ui/Alert";

export default function ResetPassword() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const token = useMemo(() => params.get("token") || "", [params]);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (password !== confirm) {
      setError("Passwords do not match");
      return;
    }
    if (!token) {
      setError("Missing reset token");
      return;
    }
    setLoading(true);
    try {
      await api.post("/auth/reset-password", { token, password });
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.message || "Could not reset password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="absolute inset-0 brand-gradient opacity-90" />
      <div className="relative z-10 mx-auto flex min-h-screen max-w-6xl items-center px-4 py-16">
        <div className="w-full max-w-md rounded-3xl bg-white/95 p-8 shadow-xl">
          <Link to="/" className="font-display text-3xl text-[var(--color-teal-deep)]">
            HandsOn
          </Link>
          <h1 className="mt-4 font-display text-3xl">Choose a new password</h1>

          {error ? (
            <Alert tone="error" className="mt-5">
              {error}
            </Alert>
          ) : null}

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <Input
              id="reset-password"
              label="New password"
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Input
              id="reset-confirm"
              label="Confirm password"
              type="password"
              required
              minLength={6}
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
            />
            <Button type="submit" className="w-full" loading={loading}>
              Update password
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
