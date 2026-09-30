interface EmptyStateProps {
  message: string;
  id?: string;
}

export default function EmptyState({ message, id }: EmptyStateProps) {
  return (
    <p className="rounded-xl bg-white/5 p-4 text-white/70" id={id} role="status">
      {message}
    </p>
  );
}
