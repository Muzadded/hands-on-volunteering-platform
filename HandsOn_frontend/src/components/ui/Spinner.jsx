import { cn } from "../../lib/cn";

export function Spinner({ className, label = "Loading" }) {
  return (
    <div
      className={cn("inline-flex items-center gap-2 text-[var(--color-teal)]", className)}
      role="status"
      aria-live="polite"
    >
      <span className="h-5 w-5 animate-spin rounded-full border-2 border-current border-r-transparent" />
      <span className="sr-only">{label}</span>
    </div>
  );
}

export function Skeleton({ className }) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-xl bg-[var(--color-ink)]/8",
        className
      )}
      aria-hidden="true"
    />
  );
}
