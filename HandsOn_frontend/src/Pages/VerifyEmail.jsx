import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import api from "../api/client";
import Alert from "../components/ui/Alert";
import { Spinner } from "../components/ui/Spinner";

export default function VerifyEmail() {
  const [params] = useSearchParams();
  const token = useMemo(() => params.get("token") || "", [params]);
  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const run = async () => {
      if (!token) {
        setStatus("error");
        setMessage("Missing verification token");
        return;
      }
      try {
        const res = await api.post("/auth/verify-email", { token });
        setStatus("success");
        setMessage(res.data?.message || "Email verified successfully");
      } catch (err) {
        setStatus("error");
        setMessage(err.response?.data?.message || "Verification failed");
      }
    };
    run();
  }, [token]);

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="absolute inset-0 brand-gradient opacity-90" />
      <div className="relative z-10 mx-auto flex min-h-screen max-w-6xl items-center px-4 py-16">
        <div className="w-full max-w-md rounded-3xl bg-white/95 p-8 shadow-xl">
          <Link to="/" className="font-display text-3xl text-[var(--color-teal-deep)]">
            HandsOn
          </Link>
          <h1 className="mt-4 font-display text-3xl">Email verification</h1>
          <div className="mt-6">
            {status === "loading" ? <Spinner label="Verifying…" /> : null}
            {status === "success" ? <Alert tone="success">{message}</Alert> : null}
            {status === "error" ? <Alert tone="error">{message}</Alert> : null}
          </div>
          <p className="mt-6 text-center text-sm">
            <Link to="/login" className="font-semibold text-[var(--color-teal-deep)]">
              Continue to login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
