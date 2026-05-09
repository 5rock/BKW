const StarRating = ({ rating = 0, count = null, size = 'text-base' }) => {
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    if (rating >= i) {
      stars.push(<span key={i} className={`material-symbols-outlined icon-filled text-primary-container ${size}`}>star</span>);
    } else if (rating >= i - 0.5) {
      stars.push(<span key={i} className={`material-symbols-outlined icon-filled text-primary-container ${size}`}>star_half</span>);
    } else {
      stars.push(<span key={i} className={`material-symbols-outlined text-gray-300 ${size}`}>star</span>);
    }
  }
  return (
    <div className="flex items-center gap-1">
      <div className="flex">{stars}</div>
      {count !== null && (
        <span className="text-label-sm text-outline ml-1">({count.toLocaleString()})</span>
      )}
    </div>
  );
};

export default StarRating;
