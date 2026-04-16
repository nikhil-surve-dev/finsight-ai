const RATES = {
  USD: 93.4,
  GBP: 121,
  INR: 1,
};

export const formatCurrency = (amount, currency = 'INR') => {
  const numericAmount = Number(amount) || 0;
  
  // Convert from INR (base) to target currency
  const convertedAmount = currency === 'INR' 
    ? numericAmount 
    : numericAmount / (RATES[currency] || 1);

  // Set locale based on currency
  const locale = currency === 'INR' ? 'en-IN' : 'en-US';

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
    maximumFractionDigits: currency === 'INR' ? 0 : 2, // Usually non-INR currencies use decimals
  }).format(convertedAmount);
};
