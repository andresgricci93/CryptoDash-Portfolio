  // Format price to currency format with dynamic decimal places
  export const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 6
    }).format(price);
  };

  //  Format percentage with sign and decimal places
  export const formatPercentage = (percentage) => {
    const isPositive = percentage > 0;
    const symbol = isPositive ? '+' : '';
    return `${symbol}${percentage.toFixed(2)}%`;
  };