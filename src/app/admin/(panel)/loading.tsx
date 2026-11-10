/** Shown instantly while an admin page loads, so navigation never feels frozen. */
export default function AdminLoading() {
  return (
    <div className="flex flex-col gap-6" aria-busy="true" aria-label="Loading">
      <div className="flex flex-col gap-2">
        <div className="h-8 w-56 animate-pulse rounded-lg bg-line" />
        <div className="h-4 w-80 max-w-full animate-pulse rounded bg-line-soft" />
      </div>
      <div className="flex flex-col gap-3">
        {Array.from({ length: 5 }, (_, i) => (
          <div key={i} className="h-16 animate-pulse rounded-2xl border border-line bg-white" />
        ))}
      </div>
    </div>
  );
}
