import { useState, useEffect } from "react";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from "@heroui/modal";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
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
}

export function StockUpdateModal({
  isOpen,
  onClose,
  onSubmit,
  product,
  isLoading,
}: StockUpdateModalProps) {
  const { showApiError } = useToast();
  const [stock, setStock] = useState(0);

  useEffect(() => {
    if (product) {
      setStock(product.stock);
    }
  }, [product, isOpen]);

  const handleSubmit = () => {
    if (stock < 0) {
      showApiError("Error", "El stock no puede ser negativo");
      return;
    }

    onSubmit({ stock });
  };

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
          <div className="flex flex-col gap-4">
            <div className="text-sm text-default-600">
              Producto: <span className="font-medium">{product?.name}</span>
            </div>
            <div className="text-sm text-default-500">
              Stock actual: <span className="font-medium">{product?.stock} unidades</span>
            </div>
            <Input
              isRequired
              label="Nuevo stock"
              labelPlacement="outside"
              min="0"
              placeholder="0"
              type="number"
              value={stock.toString()}
              onChange={(e) => setStock(parseInt(e.target.value) || 0)}
            />
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant="light" onPress={onClose}>
            Cancelar
          </Button>
          <Button color="primary" isLoading={isLoading} onPress={handleSubmit}>
            Actualizar Stock
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
} 