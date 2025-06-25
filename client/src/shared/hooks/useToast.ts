import { addToast } from "@heroui/toast";
import { getErrorMessage } from "../utils/api-utils";

export type ToastType = "success" | "danger" | "warning" | "default";

interface ToastOptions {
  title: string;
  description?: string;
  color?: ToastType;
}

export const useToast = () => {
  const showToast = ({ title, description, color = "default" }: ToastOptions) => {
    addToast({
      title,
      description,
      color,
    });
  };

  const showSuccess = (title: string, description?: string) => {
    showToast({ title, description, color: "success" });
  };

  const showError = (title: string, description?: string) => {
    showToast({ title, description, color: "danger" });
  };

  const showWarning = (title: string, description?: string) => {
    showToast({ title, description, color: "warning" });
  };

  const showApiError = (title: string, error: any) => {
    const description = getErrorMessage(error);
    showError(title, description);
  };

  return {
    showToast,
    showSuccess,
    showError,
    showWarning,
    showApiError,
  };
}; 