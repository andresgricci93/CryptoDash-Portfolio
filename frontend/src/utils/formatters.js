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

// Format Market Cap for CryptoDetailPage component 
export const formatMarketCap = (value) => {
  if (value >= 1_000_000_000_000) {
    return `${(value / 1_000_000_000_000).toFixed(2)}T`
  }
  else if (value >= 1_000_000_000) {
    return `${(value / 1_000_000_000).toFixed(2)}B`
  } 
  else if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(2)}M`
  }
  else if (value >= 1_000) {
    return `${(value / 1_000).toFixed(2)}K`
  }
  return value;
}


export const formatDate = (dateString) => {
  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    return "Invalid Date";
  }


  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  const year = date.getFullYear();
  const month = months[date.getMonth()]; 
  const day = date.getDate();
  
  let hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12 || 12; 
  
  return `${hours}:${minutes} ${ampm} - ${month} ${day} ${year} `;
};