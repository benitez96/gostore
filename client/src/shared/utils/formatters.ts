/**
 * Currency formatting utilities
 */
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
  }).format(amount);
};

/**
 * Date formatting utilities
 */
export const formatDate = (dateString?: string): string => {
  if (!dateString) return "";
  
  const date = new Date(dateString);
  return date.toLocaleDateString("es-AR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
};

export const formatDateTime = (dateString?: string): string => {
  if (!dateString) return "";
  
  const date = new Date(dateString);
  return date.toLocaleDateString("es-AR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const formatDateLong = (dateString: string): string => {
  // Si la fecha viene en formato YYYY-MM, agregar el día 01
  const fullDateString = dateString.includes("-01")
    ? dateString
    : dateString + "-01";

  // Crear la fecha usando UTC para evitar problemas de zona horaria
  const [year, month] = fullDateString.split("-");
  const date = new Date(parseInt(year), parseInt(month) - 1, 1);

  return date.toLocaleDateString("es-AR", {
    month: "long",
    year: "numeric",
  });
};

/**
 * Text formatting utilities
 */
export const capitalize = (s: string): string => {
  return s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : "";
}; 