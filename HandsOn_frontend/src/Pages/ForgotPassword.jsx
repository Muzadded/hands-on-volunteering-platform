import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/client";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Alert from "../components/ui/Alert";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);
    try {
      const res = await api.post("/auth/forgot-password", { email });
      setMessage(
        res.data?.message ||
          "If an account exists for that email, recovery instructions have been sent."
      );
    } catch (err) {
      setError(err.response?.data?.message || "Could not start password reset");
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
          <h1 className="mt-4 font-display text-3xl">Reset password</h1>
          <p className="mt-2 text-[var(--color-soil)]/80">
            Enter your email and we will send a reset link if an account exists.
          </p>

          {error ? (
            <Alert tone="error" className="mt-5">
              {error}
            </Alert>
          ) : null}
          {message ? (
            <Alert tone="success" className="mt-5">
              {message}
            </Alert>
          ) : null}

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <Input
              id="forgot-email"
              label="Email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Button type="submit" className="w-full" loading={loading}>
              Send reset link
            </Button>
          </form>

          <p className="mt-6 text-center text-sm">
            <Link to="/login" className="font-semibold text-[var(--color-teal-deep)]">
              Back to login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
