const ButtonConfetti = ({ children, className = "" }) => {
  return (
    <div className={`confetti-wrapper ${className}`}>
      <div
        className="confetti-particles"
        aria-hidden="true"
      >
        {Array.from({ length: 12 }).map((_, index) => (
          <span
            key={index}
            className={`confetti-piece confetti-piece-${index + 1}`}
          />
        ))}
      </div>

      {children}
    </div>
  );
};

export default ButtonConfetti;