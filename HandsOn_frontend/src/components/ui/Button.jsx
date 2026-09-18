import { cn } from "../../lib/cn";

const variants = {
  primary:
    "bg-[var(--color-teal)] text-white hover:bg-[var(--color-teal-deep)] shadow-sm",
  secondary:
    "bg-white text-[var(--color-ink)] border border-[var(--color-ink)]/15 hover:bg-[var(--color-mist)]",
  ghost: "bg-transparent text-[var(--color-soil)] hover:bg-[var(--color-mist)]",
  danger: "bg-[var(--color-danger)] text-white hover:opacity-90",
};

const sizes = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2.5 text-sm",
  lg: "px-5 py-3 text-base",
};

export default function Button({
  children,
  className,
  variant = "primary",
  size = "md",
  type = "button",
  disabled = false,
  loading = false,
  ...props
}) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition duration-200",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-teal)] focus-visible:ring-offset-2",
        "disabled:cursor-not-allowed disabled:opacity-55",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {loading ? "Please wait…" : children}
    </button>
  );
}
