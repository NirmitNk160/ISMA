import { createContext, useContext, useEffect, useState } from "react";
import { useSettings } from "./SettingsContext";

const CurrencyContext = createContext();

export function CurrencyProvider({ children }) {
  const { settings } = useSettings();

  // Base currency = INR
  const [rates, setRates] = useState({
    INR: 1,
    USD: 0.012, // fallback
    EUR: 0.011, // fallback
  });

  /* ================= FETCH LIVE RATES (ON APP LOAD) ================= */

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
      } catch (err) {
        console.warn("Using fallback exchange rates");
      }
    }

    fetchRates();
  }, []);

  /* ================= REAL CONVERSION ================= */

  const convert = (amountInINR) => {
    if (typeof amountInINR !== "number") return 0;

    const rate = rates[settings.currency] ?? 1;
    return amountInINR * rate;
  };

  const format = (amountInINR) => {
    const converted = convert(amountInINR);

    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: settings.currency,
      maximumFractionDigits: 2,
    }).format(converted);
  };

  return (
    <CurrencyContext.Provider
      value={{
        convert,
        format,
        rates,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  return useContext(CurrencyContext);
}
