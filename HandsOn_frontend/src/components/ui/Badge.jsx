import { cn } from "../../lib/cn";

const tones = {
  teal: "bg-[var(--color-mist)] text-[var(--color-teal-deep)]",
  clay: "bg-[#f3ebe2] text-[var(--color-clay)]",
  leaf: "bg-[#e8f2ec] text-[var(--color-leaf)]",
  warn: "bg-[#fff4e5] text-[var(--color-warning)]",
  danger: "bg-[#fdecec] text-[var(--color-danger)]",
  muted: "bg-gray-100 text-gray-700",
};

export default function Badge({ children, tone = "teal", className }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-lg px-2.5 py-1 text-xs font-semibold capitalize",
        tones[tone],
        className
      )}
    >
      {children}
    </span>
  );
}
