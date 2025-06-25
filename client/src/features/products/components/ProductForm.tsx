import { useState, useEffect } from "react";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from "@heroui/modal";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { RiShoppingBagLine } from "react-icons/ri";

import { useToast } from "@/shared/hooks/useToast";
import { formatCurrency } from "@/shared/utils/formatters";

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
}

export function ProductForm({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  title,
  submitText,
  isLoading,
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

  const handleSubmit = () => {
    if (!formData.name.trim()) {
      showApiError("Error", "El nombre del producto es requerido");
      return;
    }

    if (formData.cost < 0 || formData.price < 0 || formData.stock < 0) {
      showApiError("Error", "Los valores no pueden ser negativos");
      return;
    }

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
          <div className="flex flex-col gap-4">
            <Input
              isRequired
              label="Nombre del producto"
              placeholder="Ingresa el nombre del producto"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                isRequired
                label="Costo"
                placeholder="0.00"
                type="number"
                min="0"
                step="0.01"
                value={formData.cost.toString()}
                onChange={(e) => handleInputChange('cost', e.target.value)}
                startContent={
                  <div className="pointer-events-none flex items-center">
                    <span className="text-default-400 text-small">$</span>
                  </div>
                }
              />
              
              <Input
                isRequired
                label="Precio de venta"
                placeholder="0.00"
                type="number"
                min="0"
                step="0.01"
                value={formData.price.toString()}
                onChange={(e) => handleInputChange('price', e.target.value)}
                startContent={
                  <div className="pointer-events-none flex items-center">
                    <span className="text-default-400 text-small">$</span>
                  </div>
                }
              />
            </div>
            
            <Input
              isRequired
              label="Stock inicial"
              placeholder="0"
              type="number"
              min="0"
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
        </ModalBody>
        <ModalFooter>
          <Button variant="light" onPress={onClose}>
            Cancelar
          </Button>
          <Button
            color="primary"
            isLoading={isLoading}
            onPress={handleSubmit}
          >
            {submitText}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
} 