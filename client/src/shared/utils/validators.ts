/**
 * Form validation utilities
 */

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export interface ClientFormData {
  name: string;
  lastname: string;
  dni: string;
  email: string;
  phone: string;
  address: string;
}

export const validateClientForm = (data: ClientFormData): ValidationResult => {
  const errors: Record<string, string> = {};

  if (!data.name.trim()) {
    errors.name = "El nombre es requerido";
  }

  if (!data.lastname.trim()) {
    errors.lastname = "El apellido es requerido";
  }

  if (!data.dni.trim()) {
    errors.dni = "El DNI es requerido";
  } else if (data.dni.length < 7) {
    errors.dni = "El DNI debe tener al menos 7 caracteres";
  }

  if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.email = "El email no es válido";
  }

  if (data.phone && !/^[\d\s\-\+\(\)]+$/.test(data.phone)) {
    errors.phone = "El teléfono no es válido";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

export interface ProductFormData {
  name: string;
  cost: number;
  price: number;
  stock: number;
}

export const validateProductForm = (data: ProductFormData): ValidationResult => {
  const errors: Record<string, string> = {};

  if (!data.name.trim()) {
    errors.name = "El nombre del producto es requerido";
  }

  if (data.cost < 0 || data.price < 0 || data.stock < 0) {
    errors.general = "Los valores no pueden ser negativos";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

export const validatePositiveNumber = (value: number, fieldName: string): string | null => {
  if (value < 0) {
    return `${fieldName} no puede ser negativo`;
  }
  return null;
};

export const validateRequired = (value: string, fieldName: string): string | null => {
  if (!value.trim()) {
    return `${fieldName} es requerido`;
  }
  return null;
};

export const validateEmail = (email: string): string | null => {
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return "El email no es válido";
  }
  return null;
};

export const validatePhone = (phone: string): string | null => {
  if (phone && !/^[\d\s\-\+\(\)]+$/.test(phone)) {
    return "El teléfono no es válido";
  }
  return null;
}; 