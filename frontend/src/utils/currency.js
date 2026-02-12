// Base currency = INR
export const EXCHANGE_RATES = {
  INR: 1,
  USD: 0.012, // example rate
  EUR: 0.011,
};

export function convertFromINR(amount, currency) {
  const rate = EXCHANGE_RATES[currency] || 1;
  return amount * rate;
}
