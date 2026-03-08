import { useEffect, useState } from "react";
import { useCurrency } from "../../context/CurrencyContext";

export default function StatCard({ title, value = 0, isCurrency = false }) {
  const { format } = useCurrency();

  const numericValue =
    typeof value === "number"
      ? value
      : Number(String(value).replace(/[^\d.-]/g, "")) || 0;

  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    if (!numericValue) {
      setDisplayValue(0);
      return;
    }

    let start = 0;
    const duration = 800;
    const steps = 30;
    const increment = numericValue / steps;

    const timer = setInterval(() => {
      start += increment;

      if (start >= numericValue) {
        start = numericValue;
        clearInterval(timer);
      }

      setDisplayValue(Math.floor(start));
    }, duration / steps);

    return () => clearInterval(timer);
  }, [numericValue]);

  return (
    <div className="stat-card">
      <p className="stat-title">{title}</p>

      <h2 className="stat-value">
        {isCurrency
          ? format(displayValue)
          : displayValue.toLocaleString()}
      </h2>
    </div>
  );
}