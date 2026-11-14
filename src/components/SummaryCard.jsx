
export default function SummaryCard({
  title,
  amount,
  description,
  primary = false,
}) {
  return (
    <div className={`summary-card ${primary ? "primary" : ""}`}>
      <p className="summary-title">{title}</p>
      <h2 className="summary-amount">{amount}</h2>
      {description && (
        <span className="summary-description">{description}</span>
      )}
    </div>
  );
}
