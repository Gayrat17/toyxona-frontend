export function LoadingState({ label = 'Yuklanmoqda…' }: { label?: string }) {
  return (
    <div
      role="status"
      className="flex min-h-48 flex-1 flex-col items-center justify-center gap-4 p-8"
    >
      <span
        aria-hidden="true"
        className="h-9 w-9 animate-spin rounded-full border-2 border-gold border-t-transparent"
      />
      <p className="text-xs font-bold tracking-wide text-ink-soft">{label}</p>
    </div>
  );
}
