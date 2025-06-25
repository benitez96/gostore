/**
 * Date utilities for forms and calculations
 */

export const getCurrentDateString = (): string => {
  return new Date().toISOString().split("T")[0];
};

export const parseISODate = (dateString: string): Date => {
  return new Date(dateString);
};

export const isDateInPast = (dateString: string): boolean => {
  const date = new Date(dateString);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return date < today;
};

export const isDateInFuture = (dateString: string): boolean => {
  const date = new Date(dateString);
  const today = new Date();
  today.setHours(23, 59, 59, 999);
  return date > today;
};

export const addDays = (date: Date, days: number): Date => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

export const addMonths = (date: Date, months: number): Date => {
  const result = new Date(date);
  result.setMonth(result.getMonth() + months);
  return result;
};

export const formatForDatePicker = (dateString?: string): string => {
  if (!dateString) return getCurrentDateString();
  return dateString.split("T")[0];
}; 