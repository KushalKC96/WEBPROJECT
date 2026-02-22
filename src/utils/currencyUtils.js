// Currency utility for Nepali Rupees

/**
 * Format price in Nepali Rupees
 * @param {number} amount - Price amount
 * @returns {string} Formatted price with NPR symbol
 */
export const formatNPR = (amount) => {
  if (amount === null || amount === undefined) return 'N/A';
  
  return `NPR ${amount.toLocaleString('en-NP', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;
};

/**
 * Format price in short form (K for thousands)
 * @param {number} amount - Price amount
 * @returns {string} Formatted price in short form
 */
export const formatNPRShort = (amount) => {
  if (amount === null || amount === undefined) return 'N/A';
  
  if (amount >= 100000) {
    return `NPR ${(amount / 100000).toFixed(1)}L`; // Lakh
  } else if (amount >= 1000) {
    return `NPR ${(amount / 1000).toFixed(1)}K`; // Thousand
  }
  
  return `NPR ${amount.toFixed(2)}`;
};

/**
 * Parse NPR string to number
 * @param {string} nprString - NPR formatted string
 * @returns {number} Numeric value
 */
export const parseNPR = (nprString) => {
  if (typeof nprString === 'number') return nprString;
  
  // Remove NPR symbol and commas
  const cleaned = nprString.replace(/NPR|,/g, '').trim();
  return parseFloat(cleaned) || 0;
};

/**
 * Calculate rental price for multiple days
 * @param {number} dailyRate - Daily rental rate
 * @param {number} days - Number of days
 * @returns {number} Total rental price
 */
export const calculateRentalPrice = (dailyRate, days) => {
  if (!dailyRate || !days) return 0;
  return dailyRate * days;
};

// Example usage:
// formatNPR(12500.50)        → "NPR 12,500.50"
// formatNPRShort(125000)     → "NPR 125.0K"
// formatNPRShort(1250000)    → "NPR 12.5L"
// parseNPR("NPR 12,500.50")  → 12500.50
// calculateRentalPrice(1500, 7) → 10500