import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="border-t border-[var(--color-ink)]/10 bg-white/70 px-4 py-8 text-sm text-[var(--color-soil)]">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="font-display text-lg text-[var(--color-teal-deep)]">HandsOn</p>
        <div className="flex flex-wrap gap-4">
          <Link to="/events-feed" className="hover:text-[var(--color-teal-deep)]">
            Events
          </Link>
          <Link to="/teams" className="hover:text-[var(--color-teal-deep)]">
            Teams
          </Link>
          <Link to="/help-request" className="hover:text-[var(--color-teal-deep)]">
            Help
          </Link>
        </div>
        <p>© {new Date().getFullYear()} HandsOn</p>
      </div>
    </footer>
  );
}
