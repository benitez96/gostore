/**
 * Currency calculation and formatting utilities
 */

export const calculateSubtotal = (price: number, quantity: number): number => {
  return price * quantity;
};

export const calculateTotal = (items: Array<{ price: number; quantity: number }>): number => {
  return items.reduce((total, item) => total + calculateSubtotal(item.price, item.quantity), 0);
};

export const calculateTotalCost = (items: Array<{ cost: number; quantity: number }>): number => {
  return items.reduce((total, item) => total + (item.cost * item.quantity), 0);
};

export const calculateProfit = (
  items: Array<{ price: number; cost: number; quantity: number }>
): number => {
  const totalRevenue = calculateTotal(items);
  const totalCost = calculateTotalCost(items);
  return totalRevenue - totalCost;
};

export const calculateProfitMargin = (
  items: Array<{ price: number; cost: number; quantity: number }>
): number => {
  const totalRevenue = calculateTotal(items);
  if (totalRevenue === 0) return 0;
  
  const profit = calculateProfit(items);
  return (profit / totalRevenue) * 100;
};

export const parseCurrencyInput = (value: string): number => {
  // Remove currency symbols and parse as float
  const cleaned = value.replace(/[^\d.,-]/g, '').replace(',', '.');
  return parseFloat(cleaned) || 0;
};

export const formatCurrencyInput = (value: number): string => {
  return value.toString();
};

// Utility functions for currency calculations

/**
 * Calculate total paid from payments array
 */
export const calculateTotalPaid = (payments: Array<{ amount: number }>): number => {
  return payments.reduce((total, payment) => total + payment.amount, 0);
};

/**
 * Calculate pending amount from total and paid
 */
export const calculatePendingAmount = (total: number, paid: number): number => {
  return Math.max(0, total - paid);
};

/**
 * Calculate simple profit from revenue and cost
 */
export const calculateSimpleProfit = (revenue: number, cost: number): number => {
  return revenue - cost;
};

/**
 * Calculate margin percentage
 */
export const calculateMarginPercent = (revenue: number, cost: number): number => {
  if (revenue === 0) return 0;
  return ((revenue - cost) / revenue) * 100;
}; 