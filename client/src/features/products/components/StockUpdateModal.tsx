import { useState, useEffect } from "react";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from "@heroui/modal";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Form } from "@heroui/form";
import { RiRefreshLine } from "react-icons/ri";

import { useToast } from "@/shared/hooks/useToast";
import { Product } from "@/types";

export interface StockUpdateData {
  stock: number;
}

export interface StockUpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: StockUpdateData) => Promise<void>;
  product?: Product | null;
  isLoading?: boolean;
  validationErrors?: Record<string, string>;
}

export function StockUpdateModal({
  isOpen,
  onClose,
  onSubmit,
  product,
  isLoading,
  validationErrors,
}: StockUpdateModalProps) {
  const { showApiError } = useToast();
  const [stock, setStock] = useState(0);

  useEffect(() => {
    if (product) {
      setStock(product.stock);
    }
  }, [product, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (stock < 0) {
      showApiError("Error", "El stock no puede ser negativo");
      return;
    }

    onSubmit({ stock });
  };

  // Custom validation for stock
  const validateStock = (value: string) => {
    const numValue = parseInt(value);
    if (isNaN(numValue)) {
      return "El stock debe ser un número válido";
    }
    if (numValue < 0) {
      return "El stock no puede ser negativo";
    }
    return null;
  };

  // Check if form is valid for button state
  const isFormValid = stock >= 0 && Number.isInteger(stock);

  return (
    <Modal isOpen={isOpen} size="md" onClose={onClose}>
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <RiRefreshLine className="text-2xl text-primary" />
            <span>Actualizar Stock</span>
          </div>
        </ModalHeader>
        <ModalBody>
          <Form
            onSubmit={handleSubmit}
            validationErrors={validationErrors}
            validationBehavior="native"
          >
            <div className="w-full flex flex-col gap-4">
              <div className="text-sm text-default-600">
                Producto: <span className="font-medium">{product?.name}</span>
              </div>
              <div className="text-sm text-default-500">
                Stock actual: <span className="font-medium">{product?.stock} unidades</span>
              </div>
              <Input
                name="stock"
                isRequired
                label="Nuevo stock"
                labelPlacement="outside"
                min="0"
                step="1"
                placeholder="0"
                type="number"
                value={stock.toString()}
                onChange={(e) => setStock(parseInt(e.target.value) || 0)}
                validate={validateStock}
              />
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
                Actualizar Stock
              </Button>
            </ModalFooter>
          </Form>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
} 