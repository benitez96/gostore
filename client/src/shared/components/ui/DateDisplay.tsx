import { formatDate, formatDateTime, formatDateLong } from "../../utils/formatters";

export interface DateDisplayProps {
  date?: string;
  format?: "short" | "long" | "datetime";
  className?: string;
  emptyText?: string;
}

export function DateDisplay({ 
  date, 
  format = "short", 
  className = "",
  emptyText = "-"
}: DateDisplayProps) {
  if (!date) {
    return <span className={`text-default-400 ${className}`}>{emptyText}</span>;
  }

  let formattedDate: string;
  
  switch (format) {
    case "long":
      formattedDate = formatDateLong(date);
      break;
    case "datetime":
      formattedDate = formatDateTime(date);
      break;
    case "short":
    default:
      formattedDate = formatDate(date);
      break;
  }

  return (
    <span className={`text-default-900 ${className}`}>
      {formattedDate}
    </span>
  );
} 