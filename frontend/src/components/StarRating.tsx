interface Props {
  rating: number | null;
  size?: 'sm' | 'md' | 'lg';
  interactive?: boolean;
  onRate?: (score: number) => void;
}

export default function StarRating({ rating, size = 'md', interactive = false, onRate }: Props) {
  if (!interactive && rating === null)
    return <span className="text-slate-400 text-xs italic">No ratings yet</span>;

  const stars = [1, 2, 3, 4, 5];
  const sizeClass = size === 'sm' ? 'text-sm' : size === 'lg' ? 'text-2xl' : 'text-base';

  return (
    <span className={`inline-flex items-center gap-0.5 ${sizeClass}`}>
      {stars.map((s) => (
        <span
          key={s}
          onClick={() => interactive && onRate?.(s)}
          className={`transition-colors ${interactive ? 'cursor-pointer hover:scale-110' : ''}
            ${rating !== null && s <= Math.round(rating)
              ? 'text-amber-400 drop-shadow-sm'
              : 'text-slate-200'}`}
        >
          ★
        </span>
      ))}
      {rating !== null && (
        <span className="text-slate-500 ml-1 text-xs font-medium">{Number(rating).toFixed(1)}</span>
      )}
    </span>
  );
}
