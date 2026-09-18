import { Link } from "react-router-dom";
import Button from "../components/ui/Button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <p className="font-display text-6xl text-[var(--color-teal)]">404</p>
      <h1 className="mt-3 font-display text-3xl text-[var(--color-ink)]">Page not found</h1>
      <p className="mt-2 max-w-md text-[var(--color-soil)]/80">
        That route does not exist. Head back home or open your dashboard.
      </p>
      <div className="mt-6 flex gap-3">
        <Link to="/">
          <Button>Home</Button>
        </Link>
        <Link to="/dashboard">
          <Button variant="secondary">Dashboard</Button>
        </Link>
      </div>
    </div>
  );
}
