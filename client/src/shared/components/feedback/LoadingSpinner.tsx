import { Spinner } from "@heroui/spinner";

export interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  label?: string;
  color?: "default" | "primary" | "secondary" | "success" | "warning" | "danger";
  className?: string;
  fullPage?: boolean;
}

export function LoadingSpinner({
  size = "md",
  label = "Cargando...",
  color = "primary",
  className = "",
  fullPage = false,
}: LoadingSpinnerProps) {
  const spinner = (
    <Spinner
      size={size}
      label={label}
      color={color}
      className={className}
    />
  );

  if (fullPage) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[200px] w-full">
        {spinner}
      </div>
    );
  }

  return spinner;
} 