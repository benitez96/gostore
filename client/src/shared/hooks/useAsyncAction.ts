import { useState } from "react";
import { useToast } from "./useToast";

export interface UseAsyncActionOptions {
  successMessage?: string;
  errorMessage?: string;
  onSuccess?: () => void;
  onError?: (error: any) => void;
}

export interface UseAsyncActionReturn<T extends any[]> {
  isLoading: boolean;
  execute: (...args: T) => Promise<void>;
}

export const useAsyncAction = <T extends any[]>(
  asyncFn: (...args: T) => Promise<any>,
  options: UseAsyncActionOptions = {}
): UseAsyncActionReturn<T> => {
  const [isLoading, setIsLoading] = useState(false);
  const { showSuccess, showApiError } = useToast();

  const execute = async (...args: T): Promise<void> => {
    setIsLoading(true);
    try {
      await asyncFn(...args);
      
      if (options.successMessage) {
        showSuccess("Éxito", options.successMessage);
      }
      
      options.onSuccess?.();
    } catch (error) {
      console.error("AsyncAction error:", error);
      
      if (options.errorMessage) {
        showApiError(options.errorMessage, error);
      }
      
      options.onError?.(error);
      throw error; // Re-throw to allow caller to handle if needed
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    execute,
  };
}; 