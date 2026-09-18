import { cn } from "../../lib/cn";

export default function Input({
  id,
  label,
  error,
  className,
  type = "text",
  ...props
}) {
  return (
    <div className="space-y-1.5">
      {label ? (
        <label htmlFor={id} className="block text-sm font-semibold text-[var(--color-soil)]">
          {label}
        </label>
      ) : null}
      <input
        id={id}
        type={type}
        className={cn(
          "w-full rounded-xl border border-[var(--color-ink)]/15 bg-white px-3.5 py-2.5 text-[var(--color-ink)]",
          "placeholder:text-[var(--color-soil)]/45",
          "focus:border-[var(--color-teal)] focus:outline-none focus:ring-2 focus:ring-[var(--color-teal)]/25",
          error && "border-[var(--color-danger)]",
          className
        )}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        {...props}
      />
      {error ? (
        <p id={`${id}-error`} className="text-sm text-[var(--color-danger)]">
          {error}
        </p>
      ) : null}
    </div>
  );
}
