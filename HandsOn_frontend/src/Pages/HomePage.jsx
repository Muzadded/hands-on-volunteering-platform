import { Link } from "react-router-dom";
import Button from "../components/ui/Button";

const HERO_IMAGE =
  "https://images.unsplash.com/photo-1559027615-cd4628902d4a?auto=format&fit=crop&w=2000&q=80";

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <header className="absolute inset-x-0 top-0 z-20">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5 sm:px-6">
          <p className="font-display text-3xl text-white drop-shadow">HandsOn</p>
          <div className="flex gap-2">
            <Link to="/login">
              <Button variant="secondary" size="sm">
                Login
              </Button>
            </Link>
            <Link to="/register">
              <Button size="sm">Register</Button>
            </Link>
          </div>
        </div>
      </header>

      <section className="relative min-h-screen overflow-hidden">
        <img
          src={HERO_IMAGE}
          alt="Volunteers planting together outdoors"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-ink)]/80 via-[var(--color-ink)]/55 to-[var(--color-teal-deep)]/35" />
        <div className="absolute -right-16 top-24 h-56 w-56 rounded-full bg-[var(--color-teal)]/30 blur-3xl soft-pulse" />

        <div className="relative z-10 mx-auto flex min-h-screen max-w-6xl flex-col justify-end px-4 pb-20 pt-28 sm:px-6 sm:pb-24">
          <p className="fade-up font-display text-5xl text-white sm:text-7xl md:text-8xl">
            HandsOn
          </p>
          <h1 className="fade-up-delay mt-4 max-w-2xl font-display text-3xl leading-tight text-white sm:text-5xl">
            Put your skills where your community needs them.
          </h1>
          <p className="fade-up-delay-2 mt-4 max-w-xl text-base text-white/85 sm:text-lg">
            Find local events, help neighbors, and join teams that turn free hours into real
            impact.
          </p>
          <div className="fade-up-delay-2 mt-8 flex flex-wrap gap-3">
            <Link to="/register">
              <Button size="lg">Start volunteering</Button>
            </Link>
            <Link to="/login">
              <Button size="lg" variant="secondary">
                I already have an account
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
