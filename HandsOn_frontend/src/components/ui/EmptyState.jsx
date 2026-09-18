import Button from "./Button";

export default function EmptyState({ title, description, actionLabel, onAction }) {
  return (
    <div className="rounded-2xl border border-dashed border-[var(--color-ink)]/15 bg-white/70 px-6 py-14 text-center">
      <h3 className="font-display text-2xl text-[var(--color-ink)]">{title}</h3>
      {description ? (
        <p className="mx-auto mt-2 max-w-md text-[var(--color-soil)]/80">{description}</p>
      ) : null}
      {actionLabel && onAction ? (
        <div className="mt-6">
          <Button onClick={onAction}>{actionLabel}</Button>
        </div>
      ) : null}
    </div>
  );
}
