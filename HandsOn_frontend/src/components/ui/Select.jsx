import { cn } from "../../lib/cn";

export default function Select({ id, label, error, children, className, ...props }) {
  return (
    <div className="space-y-1.5">
      {label ? (
        <label htmlFor={id} className="block text-sm font-semibold text-[var(--color-soil)]">
          {label}
        </label>
      ) : null}
      <select
        id={id}
        className={cn(
          "w-full rounded-xl border border-[var(--color-ink)]/15 bg-white px-3.5 py-2.5 text-[var(--color-ink)]",
          "focus:border-[var(--color-teal)] focus:outline-none focus:ring-2 focus:ring-[var(--color-teal)]/25",
          error && "border-[var(--color-danger)]",
          className
        )}
        aria-invalid={Boolean(error)}
        {...props}
      >
        {children}
      </select>
      {error ? <p className="text-sm text-[var(--color-danger)]">{error}</p> : null}
    </div>
  );
}
