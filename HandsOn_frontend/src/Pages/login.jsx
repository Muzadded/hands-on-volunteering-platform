import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import api from "../api/client";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Alert from "../components/ui/Alert";

function Login({ setAuth }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await api.post("/auth/login", formData);
      if (!res.data.token) {
        throw new Error("No token received from server");
      }

      localStorage.setItem("token", res.data.token);
      const userId = jwtDecode(res.data.token).user;
      setAuth?.(true, userId);
      navigate(`/dashboard/${userId}`);
    } catch (err) {
      const message =
        typeof err.response?.data === "string"
          ? err.response.data
          : err.response?.data?.message || err.message || "Login failed";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="absolute inset-0 brand-gradient opacity-90" />
      <div className="absolute inset-y-0 right-0 hidden w-1/2 bg-[url('https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?auto=format&fit=crop&w=1400&q=80')] bg-cover bg-center lg:block" />

      <div className="relative z-10 mx-auto flex min-h-screen max-w-6xl items-center px-4 py-16 sm:px-6">
        <div className="w-full max-w-md rounded-3xl bg-white/95 p-8 shadow-xl fade-up">
          <Link to="/" className="font-display text-3xl text-[var(--color-teal-deep)]">
            HandsOn
          </Link>
          <h1 className="mt-4 font-display text-3xl text-[var(--color-ink)]">Welcome back</h1>
          <p className="mt-2 text-[var(--color-soil)]/80">
            Sign in to continue volunteering with your community.
          </p>

          {error ? (
            <Alert tone="error" className="mt-5">
              {error}
            </Alert>
          ) : null}

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <Input
              id="login-email"
              label="Email"
              type="email"
              required
              autoComplete="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
            <Input
              id="login-password"
              label="Password"
              type="password"
              required
              autoComplete="current-password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
            <Button type="submit" className="w-full" loading={loading}>
              Login
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-[var(--color-soil)]">
            New here?{" "}
            <Link to="/register" className="font-semibold text-[var(--color-teal-deep)]">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
