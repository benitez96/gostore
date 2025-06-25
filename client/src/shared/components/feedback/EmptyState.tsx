import { Button } from "@heroui/button";
import { RiInboxLine } from "react-icons/ri";

export interface EmptyStateProps {
  title: string;
  description?: string;
  action?: {
    label: string;
    onAction: () => void;
    icon?: React.ReactNode;
  };
  icon?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  title,
  description,
  action,
  icon = <RiInboxLine className="text-4xl text-default-300" />,
  className = "",
}: EmptyStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center py-12 text-center ${className}`}>
      <div className="mb-4">
        {icon}
      </div>
      
      <h3 className="text-lg font-semibold text-default-900 mb-2">
        {title}
      </h3>
      
      {description && (
        <p className="text-default-600 mb-6 max-w-md">
          {description}
        </p>
      )}
      
      {action && (
        <Button
          color="primary"
          variant="solid"
          onPress={action.onAction}
          startContent={action.icon}
        >
          {action.label}
        </Button>
      )}
    </div>
  );
} 