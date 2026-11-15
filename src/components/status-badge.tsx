const styles: Record<string, string> = {
  draft: "bg-muted text-muted-foreground",
  active: "bg-emerald-100 text-emerald-800",
  completed: "bg-blue-100 text-blue-800",
  archived: "bg-zinc-100 text-zinc-500",
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${
        styles[status] ?? styles.draft
      }`}
    >
      {status}
    </span>
  );
}