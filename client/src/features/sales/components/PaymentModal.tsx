import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from "@heroui/modal";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { DatePicker } from "@heroui/date-picker";
import { Divider } from "@heroui/divider";
import { parseDate } from "@internationalized/date";
import { LiaReceiptSolid } from "react-icons/lia";

import { api } from "@/api";
import { useToast } from "@/shared/hooks/useToast";
import { formatCurrency } from "@/shared/utils/formatters";
import { getCurrentDateString } from "@/shared/utils/date-utils";

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
  
  const [amount, setAmount] = useState<string>("");
  const [paymentDate, setPaymentDate] = useState(getCurrentDateString());

  const calculatePendingAmount = () => {
    if (!quota) return 0;
    
    const totalPaid = quota.payments?.reduce(
      (sum: number, payment: any) => sum + payment.amount,
      0,
    ) || 0;
    
    return quota.amount - totalPaid;
  };

  const handleAmountChange = (value: string) => {
    // Remove non-numeric characters except decimal point
    const numericValue = value.replace(/[^0-9.]/g, "");
    setAmount(numericValue);
  };

  const paymentMutation = useMutation({
    mutationFn: async (paymentData: any) => {
      const response = await api.post(`/api/quotas/${quota.id}/payments`, paymentData);
      return response.data;
    },
    onSuccess: () => {
      showSuccess("Pago registrado", "El pago se ha registrado correctamente.");
      queryClient.invalidateQueries({ queryKey: ["sale-details", saleId] });
      queryClient.invalidateQueries({ queryKey: ["client"] });
      onSuccess();
      onClose();
      // Reset form
      setAmount("");
      setPaymentDate(getCurrentDateString());
    },
    onError: (error) => {
      showApiError("Error al registrar pago", error);
    },
  });

  const handleSubmit = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      showApiError("Error", "Ingrese un monto válido");
      return;
    }

    const pendingAmount = calculatePendingAmount();
    if (parseFloat(amount) > pendingAmount) {
      showApiError("Error", `El monto no puede ser mayor a ${formatCurrency(pendingAmount)}`);
      return;
    }

    const paymentData = {
      amount: parseFloat(amount),
      date: paymentDate,
    };

    paymentMutation.mutate(paymentData);
  };

  const pendingAmount = calculatePendingAmount();

  return (
    <Modal isOpen={isOpen} size="md" onClose={onClose}>
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <LiaReceiptSolid className="text-2xl text-success" />
            <span>Registrar Pago</span>
          </div>
        </ModalHeader>
        <ModalBody>
          <div className="flex flex-col gap-4">
            <div className="text-sm text-default-600">
              <div className="flex justify-between">
                <span>Cuota #{quota?.number}:</span>
                <span className="font-medium">{formatCurrency(quota?.amount || 0)}</span>
              </div>
              <div className="flex justify-between">
                <span>Total pagado:</span>
                <span className="font-medium">
                  {formatCurrency(
                    quota?.payments?.reduce(
                      (sum: number, p: any) => sum + p.amount,
                      0,
                    ) || 0,
                  )}
                </span>
              </div>
              <Divider className="my-2" />
              <div className="flex justify-between font-semibold">
                <span>Pendiente:</span>
                <span>{formatCurrency(pendingAmount)}</span>
              </div>
            </div>

            <Input
              isRequired
              label="Monto del pago"
              placeholder="0.00"
              value={amount}
              onChange={(e) => handleAmountChange(e.target.value)}
              startContent={
                <div className="pointer-events-none flex items-center">
                  <span className="text-default-400 text-small">$</span>
                </div>
              }
            />

            <DatePicker
              label="Fecha del pago"
              value={parseDate(paymentDate)}
              onChange={(date) => date && setPaymentDate(date.toString())}
            />
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant="light" onPress={onClose}>
            Cancelar
          </Button>
          <Button
            color="success"
            onPress={handleSubmit}
            isLoading={paymentMutation.isPending}
          >
            Registrar Pago
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
} 