export function Stars({
  rating,
  reviewCount,
}: {
  rating: number;
  reviewCount?: number;
}) {
  return (
    <div className="flex items-center gap-1.5 text-xs text-slate-500">
      <div className="flex" aria-label={`Rated ${rating} out of 5`}>
        {[1, 2, 3, 4, 5].map((star) => (
          <svg
            key={star}
            viewBox="0 0 20 20"
            className={`h-3.5 w-3.5 ${
              star <= Math.round(rating) ? "text-amber-400" : "text-slate-200"
            }`}
            fill="currentColor"
            aria-hidden
          >
            <path d="m10 1.5 2.6 5.27 5.82.85-4.21 4.1 1 5.79L10 14.78l-5.21 2.73 1-5.79-4.21-4.1 5.82-.85L10 1.5Z" />
          </svg>
        ))}
      </div>
      <span>
        {rating.toFixed(1)}
        {typeof reviewCount === "number" && ` (${reviewCount})`}
      </span>
    </div>
  );
}
