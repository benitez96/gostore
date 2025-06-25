import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from "@heroui/modal";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { DatePicker } from "@heroui/date-picker";
import { parseDate, getLocalTimeZone } from "@internationalized/date";
import { LiaReceiptSolid, LiaCalendarAltSolid } from "react-icons/lia";

import { api } from "@/api";
import { useToast } from "@/shared/hooks/useToast";

export interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  quota: any;
  saleId: string;
  onSuccess: () => void;
}

export function PaymentModal({
  isOpen,
  onClose,
  quota,
  saleId,
  onSuccess,
}: PaymentModalProps) {
  const queryClient = useQueryClient();
  const { showSuccess, showApiError } = useToast();
  
  const [amount, setAmount] = useState(quota?.amount || 0);
  const [date, setDate] = useState(
    parseDate(new Date().toISOString().split("T")[0]),
  );
  const [isLoading, setIsLoading] = useState(false);

  // Calcular el monto pendiente real (total de la cuota menos pagos realizados)
  const calculatePendingAmount = () => {
    const totalQuotaAmount = quota?.amount || 0;
    const totalPaid =
      quota?.payments?.reduce(
        (sum: number, payment: any) => sum + payment.amount,
        0,
      ) || 0;

    return Math.max(0, totalQuotaAmount - totalPaid);
  };

  const pendingAmount = calculatePendingAmount();

  // Actualizar el monto cuando se abre el modal o cambia la cuota
  useEffect(() => {
    if (isOpen && quota) {
      const newPendingAmount = calculatePendingAmount();
      setAmount(newPendingAmount);
    }
  }, [isOpen, quota]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
    }).format(amount);
  };

  const handleAmountChange = (value: string) => {
    const newAmount = parseFloat(value) || 0;
    const maxAmount = calculatePendingAmount();

    // No permitir montos mayores al pendiente
    if (newAmount > maxAmount) {
      setAmount(maxAmount);
    } else if (newAmount < 0) {
      setAmount(0);
    } else {
      setAmount(newAmount);
    }
  };

  const handleSubmit = async () => {
    if (amount <= 0) return;

    const maxAmount = calculatePendingAmount();

    if (amount > maxAmount) {
      showApiError("Monto inválido", `No puedes pagar más de ${formatCurrency(maxAmount)}`);
      return;
    }

    setIsLoading(true);
    try {
      // Convertir la fecha del DatePicker a string ISO
      const paymentDate = date.toDate(getLocalTimeZone()).toISOString();

      await api.post(`/api/payments`, {
        quota_id: parseInt(quota.id.toString()),
        amount: amount,
        date: paymentDate,
      });

      // Llamar a la función de éxito para actualizar los datos
      onSuccess();
      onClose();

      // Mostrar toast de éxito
      showSuccess("Pago realizado", `Se ha registrado el pago de ${formatCurrency(amount)}`);
    } catch (error) {
      console.error("Error al crear el pago:", error);
      showApiError("Error al realizar el pago", "No se pudo registrar el pago. Inténtalo de nuevo.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} size="md" onClose={onClose}>
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <LiaReceiptSolid className="text-2xl text-success" />
            <span>Realizar Pago</span>
          </div>
        </ModalHeader>
        <ModalBody>
          <div className="space-y-4">
            <div className="p-4 bg-default-50 rounded-lg">
              <h4 className="font-medium mb-2">Información de la Cuota</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-default-500">Número de cuota:</p>
                  <p className="font-medium">#{quota?.number}</p>
                </div>
                <div>
                  <p className="text-default-500">Monto total de la cuota:</p>
                  <p className="font-medium">
                    {formatCurrency(quota?.amount || 0)}
                  </p>
                </div>
                <div>
                  <p className="text-default-500">Total pagado:</p>
                  <p className="font-medium text-success">
                    {formatCurrency(
                      quota?.payments?.reduce(
                        (sum: number, payment: any) => sum + payment.amount,
                        0,
                      ) || 0,
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-default-500">Monto pendiente:</p>
                  <p className="font-medium text-warning">
                    {formatCurrency(pendingAmount)}
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                description={`Máximo: ${formatCurrency(pendingAmount)}`}
                errorMessage={
                  amount > pendingAmount
                    ? `No puede exceder ${formatCurrency(pendingAmount)}`
                    : ""
                }
                isInvalid={amount > pendingAmount}
                label="Monto a pagar"
                labelPlacement="outside"
                max={pendingAmount}
                min="0"
                placeholder="0.00"
                startContent={
                  <div className="pointer-events-none flex items-center">
                    <span className="text-default-400 text-small">$</span>
                  </div>
                }
                step="0.01"
                type="number"
                value={amount.toString()}
                onChange={(e) => handleAmountChange(e.target.value)}
              />

              <DatePicker
                label="Fecha de pago"
                labelPlacement="outside"
                startContent={
                  <LiaCalendarAltSolid className="text-default-400" />
                }
                value={date}
                onChange={(newDate) => {
                  if (newDate) {
                    setDate(newDate);
                  }
                }}
              />
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant="light" onPress={onClose}>
            Cancelar
          </Button>
          <Button
            color="success"
            isDisabled={amount <= 0 || amount > pendingAmount}
            isLoading={isLoading}
            onPress={handleSubmit}
          >
            Realizar Pago
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
} 