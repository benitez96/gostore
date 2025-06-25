import { useState, useEffect } from "react";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from "@heroui/modal";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Form } from "@heroui/form";
import { RiShoppingBagLine } from "react-icons/ri";

import { useToast } from "@/shared/hooks/useToast";
import { formatCurrency } from "@/shared/utils/formatters";
import { CurrencyInput } from "@/shared/components/ui";

export interface ProductFormData {
  name: string;
  cost: number;
  price: number;
  stock: number;
}

export interface ProductFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (product: ProductFormData) => Promise<void>;
  initialData?: Partial<ProductFormData>;
  title: string;
  submitText: string;
  isLoading?: boolean;
  validationErrors?: Record<string, string>;
}

export function ProductForm({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  title,
  submitText,
  isLoading,
  validationErrors,
}: ProductFormProps) {
  const { showApiError } = useToast();
  
  const [formData, setFormData] = useState<ProductFormData>({
    name: "",
    cost: 0,
    price: 0,
    stock: 0,
  });



  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || "",
        cost: initialData.cost || 0,
        price: initialData.price || 0,
        stock: initialData.stock || 0,
      });
    } else {
      setFormData({
        name: "",
        cost: 0,
        price: 0,
        stock: 0,
      });
    }
  }, [initialData, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleInputChange = (field: keyof ProductFormData, value: string) => {
    if (field === 'name') {
      setFormData(prev => ({ ...prev, [field]: value }));
    } else {
      const numericValue = field === 'stock' ? parseInt(value) || 0 : parseFloat(value) || 0;
      setFormData(prev => ({ ...prev, [field]: numericValue }));
    }
  };

  const handleCurrencyChange = (field: 'cost' | 'price', value: number | undefined) => {
    const numValue = value || 0;
    
    if (field === 'cost') {
      // SIEMPRE auto-calcular precio cuando cambia el costo
      const suggestedPrice = Math.round((numValue / 0.7) * 100) / 100;
      setFormData(prev => ({ 
        ...prev, 
        cost: numValue,
        price: suggestedPrice
      }));
    } else {
      // Solo cambiar precio
      setFormData(prev => ({ ...prev, price: numValue }));
    }
  };

  // Check if form is valid for button state
  const isFormValid = 
    formData.name.trim().length >= 2 &&
    formData.cost >= 0 &&
    formData.price >= 0 &&
    formData.stock >= 0 &&
    Number.isInteger(formData.stock);

  // Custom validation for product name
  const validateProductName = (value: string) => {
    if (!value.trim()) {
      return "El nombre del producto es requerido";
    }
    if (value.length < 2) {
      return "El nombre debe tener al menos 2 caracteres";
    }
    return null;
  };

  return (
    <Modal isOpen={isOpen} size="2xl" onClose={onClose}>
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <RiShoppingBagLine className="text-2xl text-primary" />
            <span>{title}</span>
          </div>
        </ModalHeader>
        <ModalBody>
          <Form
            onSubmit={handleSubmit}
            validationErrors={validationErrors}
            validationBehavior="native"
          >
            <div className="flex flex-col gap-4 w-full">
              <Input
                name="name"
                isRequired
                label="Nombre del producto"
                placeholder="Ingresa el nombre del producto"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                validate={validateProductName}
                minLength={2}
              />
              
              <div className="grid grid-cols-2 gap-4">
                <CurrencyInput
                  name="cost"
                  isRequired
                  label="Costo"
                  placeholder="0.00"
                  value={formData.cost}
                  onValueChange={(value) => handleCurrencyChange('cost', value)}
                  min={0}
                />
                
                <CurrencyInput
                  name="price"
                  isRequired
                  label="Precio de venta"
                  placeholder="0.00"
                  value={formData.price}
                  onValueChange={(value) => handleCurrencyChange('price', value)}
                  min={0}
                />
              </div>
              
              <Input
                name="stock"
                isRequired
                label="Stock inicial"
                placeholder="0"
                type="number"
                min="0"
                step="1"
                value={formData.stock.toString()}
                onChange={(e) => handleInputChange('stock', e.target.value)}
              />
              
              {/* Profit Margin Preview */}
              {formData.cost > 0 && formData.price > 0 && (
                <div className="p-4 bg-default-50 rounded-lg">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-default-600">Ganancia:</span>
                      <p className={`font-semibold ${formData.price - formData.cost >= 0 ? 'text-success' : 'text-danger'}`}>
                        {formatCurrency(formData.price - formData.cost)}
                      </p>
                    </div>
                    <div>
                      <span className="text-default-600">Margen:</span>
                      <p className="font-semibold">
                        {((formData.price - formData.cost) / formData.price * 100).toFixed(1)}%
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <ModalFooter className="flex justify-end gap-2 w-full">
              <Button variant="light" onPress={onClose}>
                Cancelar
              </Button>
              <Button
                color="primary"
                isLoading={isLoading}
                isDisabled={!isFormValid}
                type="submit"
              >
                {submitText}
              </Button>
            </ModalFooter>
          </Form>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
} 