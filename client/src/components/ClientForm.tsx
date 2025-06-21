import { useState, useEffect } from "react";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { RiCloseLine } from "react-icons/ri";
import { ClientDetail } from "@/api";

interface ClientFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (client: Omit<ClientDetail, 'id'>) => Promise<void>;
  initialData?: Partial<ClientDetail>;
  title: JSX.Element | string;
  submitText: string;
  isLoading?: boolean;
}

export default function ClientForm({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  title,
  submitText,
  isLoading = false,
}: ClientFormProps) {
  const [formData, setFormData] = useState<Omit<ClientDetail, 'id'>>({
    name: "",
    lastname: "",
    dni: "",
    email: "",
    phone: "",
    address: "",
    state: { id: 1, description: "OK" },
    sales: [],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Initialize form with initial data
  useEffect(() => {
    if (initialData) {
      setFormData(prev => ({
        ...prev,
        ...initialData,
      }));
    } else {
      // Reset form when no initial data (create mode)
      setFormData({
        name: "",
        lastname: "",
        dni: "",
        email: "",
        phone: "",
        address: "",
        state: { id: 1, description: "OK" },
        sales: [],
      });
    }
    // Clear any previous errors
    setErrors({});
  }, [initialData]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "El nombre es requerido";
    }

    if (!formData.lastname.trim()) {
      newErrors.lastname = "El apellido es requerido";
    }

    if (!formData.dni.trim()) {
      newErrors.dni = "El DNI es requerido";
    } else if (formData.dni.length < 7) {
      newErrors.dni = "El DNI debe tener al menos 7 caracteres";
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "El email no es válido";
    }

    if (formData.phone && !/^[\d\s\-\+\(\)]+$/.test(formData.phone)) {
      newErrors.phone = "El teléfono no es válido";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      await onSubmit(formData);
      onClose();
      // Reset form
      setFormData({
        name: "",
        lastname: "",
        dni: "",
        email: "",
        phone: "",
        address: "",
        state: { id: 1, description: "OK" },
        sales: [],
      });
      setErrors({});
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };

  const handleInputChange = (field: keyof Omit<ClientDetail, 'id'>) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = e.target.value;
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-content1 rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto relative">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-default-400 hover:text-default-600 transition-colors"
          disabled={isLoading}
        >
          <RiCloseLine className="text-xl" />
        </button>

        <form onSubmit={handleSubmit}>
          <div className="mb-6 pr-8">
            <div className="flex items-center gap-2 mb-2">
              {title}
            </div>
            <p className="text-sm text-default-500">
              Complete la información del cliente
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {/* Nombre */}
            <Input
              label="Nombre"
              placeholder="Ingrese el nombre"
              value={formData.name}
              onChange={handleInputChange('name')}
              isInvalid={!!errors.name}
              errorMessage={errors.name}
              isRequired
            />

            {/* Apellido */}
            <Input
              label="Apellido"
              placeholder="Ingrese el apellido"
              value={formData.lastname}
              onChange={handleInputChange('lastname')}
              isInvalid={!!errors.lastname}
              errorMessage={errors.lastname}
              isRequired
            />

            {/* DNI */}
            <Input
              label="DNI"
              placeholder="Ingrese el DNI"
              value={formData.dni}
              onChange={handleInputChange('dni')}
              isInvalid={!!errors.dni}
              errorMessage={errors.dni}
              isRequired
            />

            {/* Email */}
            <Input
              label="Email"
              placeholder="Ingrese el email"
              type="email"
              value={formData.email}
              onChange={handleInputChange('email')}
              isInvalid={!!errors.email}
              errorMessage={errors.email}
            />

            {/* Teléfono */}
            <Input
              label="Teléfono"
              placeholder="Ingrese el teléfono"
              value={formData.phone}
              onChange={handleInputChange('phone')}
              isInvalid={!!errors.phone}
              errorMessage={errors.phone}
            />

            {/* Dirección */}
            <div className="md:col-span-2">
              <Input
                label="Dirección"
                placeholder="Ingrese la dirección completa"
                value={formData.address}
                onChange={handleInputChange('address')}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button color="default" variant="light" onPress={onClose}>
              Cancelar
            </Button>
            <Button color="primary" type="submit" isLoading={isLoading}>
              {submitText}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
} 