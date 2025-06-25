import { formatCurrency } from "../../utils/formatters";

export interface CurrencyDisplayProps {
  amount: number;
  className?: string;
  showSign?: boolean;
  size?: "sm" | "md" | "lg";
}

export function CurrencyDisplay({ 
  amount, 
  className = "", 
  showSign = false,
  size = "md" 
}: CurrencyDisplayProps) {
  const sizeClasses = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg font-semibold",
  };

  const colorClass = amount >= 0 
    ? "text-success-600" 
    : "text-danger-600";

  const displayAmount = showSign && amount > 0 
    ? `+${formatCurrency(amount)}`
    : formatCurrency(amount);

  return (
    <span className={`${sizeClasses[size]} ${showSign ? colorClass : "text-default-900"} font-medium ${className}`}>
      {displayAmount}
    </span>
  );
} 