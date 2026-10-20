import React from 'react';
import { Star } from 'lucide-react';

export default function RatingStars({ rating = 5.0, totalReviews, size = 15 }) {
  const numRating = Number(rating) || 5;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
      <div style={{ display: 'flex', color: '#f59e0b' }}>
        {[1, 2, 3, 4, 5].map((i) => (
          <Star
            key={i}
            size={size}
            fill={i <= Math.round(numRating) ? '#f59e0b' : 'none'}
            stroke="#f59e0b"
          />
        ))}
      </div>
      <span style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-main)', marginLeft: '0.2rem' }}>
        {numRating.toFixed(1)}
      </span>
      {totalReviews !== undefined && (
        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          ({totalReviews})
        </span>
      )}
    </div>
  );
}
