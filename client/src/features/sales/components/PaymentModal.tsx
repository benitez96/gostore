import { useState, useEffect } from "react";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from "@heroui/modal";
import { Button } from "@heroui/button";
import { DatePicker } from "@heroui/date-picker";
import { Form } from "@heroui/form";
import { parseDate, getLocalTimeZone } from "@internationalized/date";
import { LiaReceiptSolid, LiaCalendarAltSolid } from "react-icons/lia";

import { api } from "@/api";
import { useToast } from "@/shared/hooks/useToast";
import { CurrencyInput } from "@/shared/components/ui";

export interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  quota: any;
  onSuccess: () => void;
}

interface PaymentFormData {
  amount: number;
  date: any;
}

export function PaymentModal({
  isOpen,
  onClose,
  quota,
  onSuccess,
}: PaymentModalProps) {
  const { showSuccess, showApiError } = useToast();
  
  const [formData, setFormData] = useState<PaymentFormData>({
    amount: 0,
    date: parseDate(new Date().toISOString().split("T")[0]),
  });
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

  // Función para formatear moneda
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
    }).format(amount);
  };

  // Actualizar el monto cuando se abre el modal o cambia la cuota
  useEffect(() => {
    if (isOpen && quota) {
      const newPendingAmount = calculatePendingAmount();
      setFormData(prev => ({
        ...prev,
        amount: newPendingAmount,
        date: parseDate(new Date().toISOString().split("T")[0]),
      }));
    }
  }, [isOpen, quota]);

  const handleAmountChange = (value: number | undefined) => {
    const newAmount = value || 0;
    const maxAmount = calculatePendingAmount();

    // No permitir montos mayores al pendiente
    if (newAmount > maxAmount) {
      setFormData(prev => ({ ...prev, amount: maxAmount }));
    } else if (newAmount < 0) {
      setFormData(prev => ({ ...prev, amount: 0 }));
    } else {
      setFormData(prev => ({ ...prev, amount: newAmount }));
    }
  };

  const handleDateChange = (newDate: any) => {
    if (newDate) {
      setFormData(prev => ({ ...prev, date: newDate }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.amount <= 0) return;

    const maxAmount = calculatePendingAmount();

    if (formData.amount > maxAmount) {
      showApiError("Monto inválido", `No puedes pagar más de ${formatCurrency(maxAmount)}`);
      return;
    }

    setIsLoading(true);
    try {
      // Convertir la fecha del DatePicker a string ISO
      const paymentDate = formData.date.toDate(getLocalTimeZone()).toISOString();

      await api.post(`/api/payments`, {
        quota_id: parseInt(quota.id.toString()),
        amount: formData.amount,
        date: paymentDate,
      });

      // Llamar a la función de éxito para actualizar los datos
      onSuccess();
      onClose();

      // Mostrar toast de éxito
      showSuccess("Pago realizado", `Se ha registrado el pago de ${formatCurrency(formData.amount)}`);
    } catch (error) {
      console.error("Error al crear el pago:", error);
      showApiError("Error al realizar el pago", "No se pudo registrar el pago. Inténtalo de nuevo.");
    } finally {
      setIsLoading(false);
    }
  };

  // Validación del monto
  const validateAmount = (value: number) => {
    if (value <= 0) {
      return "El monto debe ser mayor a 0";
    }
    // Usar una pequeña tolerancia para manejar problemas de precisión de punto flotante
    if (value > pendingAmount + 0.001) {
      return `No puede exceder ${formatCurrency(pendingAmount)}`;
    }
    return null;
  };

  // Check if form is valid for button state
  const isFormValid = 
    formData.amount > 0 &&
    formData.amount <= pendingAmount + 0.001 &&
    formData.date;

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
          <Form
            onSubmit={handleSubmit}
            validationBehavior="native"
          >
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                <CurrencyInput
                  name="amount"
                  isRequired
                  label="Monto a pagar"
                  labelPlacement="outside"
                  placeholder="0.00"
                  value={formData.amount}
                  onValueChange={handleAmountChange}
                  min={0}
                  isClearable
                  validate={validateAmount}
                />

                <DatePicker
                  name="date"
                  isRequired
                  label="Fecha de pago"
                  labelPlacement="outside"
                  startContent={
                    <LiaCalendarAltSolid className="text-default-400" />
                  }
                  value={formData.date}
                  onChange={handleDateChange}
                />
              </div>
            </div>
            
            <ModalFooter className="flex w-full justify-end">
              <Button variant="light" onPress={onClose}>
                Cancelar
              </Button>
              <Button
                color="success"
                isDisabled={!isFormValid}
                isLoading={isLoading}
                type="submit"
              >
                Realizar Pago
              </Button>
            </ModalFooter>
          </Form>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
} 