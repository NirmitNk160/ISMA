import { createContext, useContext, useEffect, useState } from "react";
import { useSettings } from "./SettingsContext";

const CurrencyContext = createContext();

export function CurrencyProvider({ children }) {
  const { settings } = useSettings();

  /* ✅ ALWAYS SAFE CURRENCY */
  const currency = settings?.currency || "INR";

  /* ================= BASE RATES ================= */
  const [rates, setRates] = useState({
    INR: 1,
    USD: 0.012,
    EUR: 0.011,
  });

  /* ================= FETCH LIVE RATES ================= */
  useEffect(() => {
    async function fetchRates() {
      try {
        const res = await fetch(
          "https://api.exchangerate.host/latest?base=INR"
        );
        const data = await res.json();

        if (data?.rates?.USD && data?.rates?.EUR) {
          setRates({
            INR: 1,
            USD: data.rates.USD,
            EUR: data.rates.EUR,
          });
        }
      } catch {
        console.warn("Using fallback exchange rates");
      }
    }

    fetchRates();
  }, []);

  /* ================= CONVERT ================= */
  const convert = (amountInINR) => {
    if (!amountInINR || isNaN(amountInINR)) return 0;

    const rate = rates[currency] ?? 1;
    return Number(amountInINR) * rate;
  };

  /* ================= FORMAT (SAFE) ================= */
  const format = (amountInINR) => {
    try {
      const converted = convert(amountInINR);

      return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency,
        maximumFractionDigits: 2,
      }).format(converted);
    } catch (err) {
      console.warn("Currency format fallback:", err);

      return `₹${Number(amountInINR || 0).toFixed(2)}`;
    }
  };

  return (
    <CurrencyContext.Provider value={{ convert, format, rates }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  return useContext(CurrencyContext);
}
