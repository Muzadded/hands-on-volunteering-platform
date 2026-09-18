import { cn } from "../../lib/cn";

const tones = {
  info: "border-[var(--color-teal)]/30 bg-[var(--color-mist)] text-[var(--color-teal-deep)]",
  error: "border-[var(--color-danger)]/30 bg-[#fdecec] text-[var(--color-danger)]",
  success: "border-[var(--color-leaf)]/30 bg-[#e8f2ec] text-[var(--color-leaf)]",
};

export default function Alert({ children, tone = "info", className }) {
  return (
    <div
      role="alert"
      className={cn(
        "rounded-xl border px-4 py-3 text-sm",
        tones[tone],
        className
      )}
    >
      {children}
    </div>
  );
}
