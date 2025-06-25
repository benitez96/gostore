import { useState } from "react";

export interface UseFormValidationReturn<T> {
  data: T;
  errors: Record<string, string>;
  updateField: <K extends keyof T>(field: K, value: T[K]) => void;
  setData: (data: T) => void;
  setError: (field: string, error: string) => void;
  clearError: (field: string) => void;
  clearAllErrors: () => void;
  validate: (validator: (data: T) => Record<string, string>) => boolean;
  reset: (resetData?: T) => void;
  hasErrors: boolean;
}

export const useFormValidation = <T extends Record<string, any>>(
  initialData: T
): UseFormValidationReturn<T> => {
  const [data, setDataState] = useState<T>(initialData);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const updateField = <K extends keyof T>(field: K, value: T[K]) => {
    setDataState(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field as string]) {
      clearError(field as string);
    }
  };

  const setData = (newData: T) => {
    setDataState(newData);
    clearAllErrors();
  };

  const setError = (field: string, error: string) => {
    setErrors(prev => ({ ...prev, [field]: error }));
  };

  const clearError = (field: string) => {
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  };

  const clearAllErrors = () => {
    setErrors({});
  };

  const validate = (validator: (data: T) => Record<string, string>): boolean => {
    const validationErrors = validator(data);
    setErrors(validationErrors);
    return Object.keys(validationErrors).length === 0;
  };

  const reset = (resetData?: T) => {
    setDataState(resetData || initialData);
    clearAllErrors();
  };

  const hasErrors = Object.keys(errors).length > 0;

  return {
    data,
    errors,
    updateField,
    setData,
    setError,
    clearError,
    clearAllErrors,
    validate,
    reset,
    hasErrors,
  };
}; 