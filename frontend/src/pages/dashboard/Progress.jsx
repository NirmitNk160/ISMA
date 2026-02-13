export default function Progress({ label, value, max = 100 }) {
  const percentage =
    max > 0 ? Math.min((value / max) * 100, 100) : 0;

  return (
    <div className="progress">
      <div className="progress-header">
        <span>{label}</span>
        <span>{value}</span>
      </div>

      <div className="progress-bar">
        <div
          className="progress-fill"
          style={{ "--progress": `${percentage}%` }}
        />
      </div>
    </div>
  );
}
