import { useState, useEffect } from "react";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from "@heroui/modal";
import { Button } from "@heroui/button";
import { DatePicker } from "@heroui/date-picker";
import { Form } from "@heroui/form";
import { Chip } from "@heroui/chip";
import { parseDate, getLocalTimeZone } from "@internationalized/date";
import { LiaCalendarAltSolid } from "react-icons/lia";
import { RiEditLine } from "react-icons/ri";

import { api } from "@/api";
import { useToast } from "@/shared/hooks/useToast";
import { CurrencyInput } from "@/shared/components/ui";

const getQuotaStatus = (quota: any): {
  color: "success" | "primary" | "warning" | "danger" | "default" | "secondary";
  text: string;
} => {
  if (quota.is_paid) {
    return { color: "success", text: "Pagada" };
  }
  
  switch (quota.state) {
    case 1:
      return { color: "primary", text: "Pendiente" };
    case 2:
      return { color: "warning", text: "Advertencia" };
    case 3:
      return { color: "danger", text: "Vencida" };
    default:
      return { color: "default", text: "Desconocido" };
  }
};

export interface EditQuotaModalProps {
  isOpen: boolean;
  onClose: () => void;
  quota: any;
  onSuccess: () => void;
}

interface QuotaFormData {
  amount: number;
  dueDate: any;
}

export function EditQuotaModal({
  isOpen,
  onClose,
  quota,
  onSuccess,
}: EditQuotaModalProps) {
  const { showSuccess, showApiError } = useToast();
  
  const [formData, setFormData] = useState<QuotaFormData>({
    amount: 0,
    dueDate: parseDate(new Date().toISOString().split("T")[0]),
  });
  const [isLoading, setIsLoading] = useState(false);

  // Actualizar los valores cuando se abre el modal o cambia la cuota
  useEffect(() => {
    if (isOpen && quota) {
      setFormData({
        amount: quota.amount || 0,
        dueDate: quota.due_date
          ? parseDate(quota.due_date.split("T")[0])
          : parseDate(new Date().toISOString().split("T")[0]),
      });
    }
  }, [isOpen, quota]);

  // Función para formatear moneda
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
    }).format(amount);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Sin fecha";
    return new Date(dateString).toLocaleDateString("es-AR");
  };

  const handleAmountChange = (value: number | undefined) => {
    const newAmount = value || 0;
    setFormData(prev => ({ ...prev, amount: newAmount }));
  };

  const handleDateChange = (newDate: any) => {
    if (newDate) {
      setFormData(prev => ({ ...prev, dueDate: newDate }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.amount <= 0) {
      showApiError("Monto inválido", "El monto debe ser mayor a 0");
      return;
    }

    setIsLoading(true);
    try {
      // Convertir la fecha del DatePicker a string ISO
      const quotaDueDate = formData.dueDate.toDate(getLocalTimeZone()).toISOString();

      await api.put(`/api/quotas/${quota.id}`, {
        amount: formData.amount,
        due_date: quotaDueDate,
      });

      // Llamar a la función de éxito para actualizar los datos
      onSuccess();
      onClose();

      // Mostrar toast de éxito
      showSuccess("Cuota actualizada", `Se ha actualizado la cuota #${quota.number}`);
    } catch (error) {
      console.error("Error al actualizar la cuota:", error);
      showApiError("Error al actualizar la cuota", "No se pudo actualizar la cuota. Inténtalo de nuevo.");
    } finally {
      setIsLoading(false);
    }
  };

  // Validación del monto
  const validateAmount = (value: number) => {
    if (value <= 0) {
      return "El monto debe ser mayor a 0";
    }
    return null;
  };

  // Check if form is valid for button state
  const isFormValid = 
    formData.amount > 0 &&
    formData.dueDate;

  return (
    <Modal isOpen={isOpen} size="md" onClose={onClose}>
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <RiEditLine className="text-2xl text-primary" />
            <span>Editar Cuota</span>
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
                    <p className="text-default-500">Estado:</p>
                    {(() => {
                      const status = getQuotaStatus(quota);
                      return (
                        <Chip color={status.color} size="sm" variant="flat">
                          {status.text}
                        </Chip>
                      );
                    })()}
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
                    <p className="text-default-500">
                      Fecha de vencimiento actual:
                    </p>
                    <p className="font-medium">
                      {quota?.due_date ? formatDate(quota.due_date) : "Sin fecha"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                <CurrencyInput
                  name="amount"
                  isRequired
                  label="Monto de la cuota"
                  labelPlacement="outside"
                  placeholder="0.00"
                  value={formData.amount}
                  onValueChange={handleAmountChange}
                  min={0}
                  isClearable
                  validate={validateAmount}
                />

                <DatePicker
                  name="dueDate"
                  isRequired
                  label="Fecha de vencimiento"
                  labelPlacement="outside"
                  startContent={
                    <LiaCalendarAltSolid className="text-default-400" />
                  }
                  value={formData.dueDate}
                  onChange={handleDateChange}
                />
              </div>

              {/* Resumen de cambios */}
              <div className="p-4 bg-primary-50 rounded-lg">
                <h4 className="font-medium mb-2 text-primary">
                  Resumen de Cambios
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Monto anterior:</span>
                    <span className="font-medium">
                      {formatCurrency(quota?.amount || 0)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Monto nuevo:</span>
                    <span className="font-medium text-primary">
                      {formatCurrency(formData.amount)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Diferencia:</span>
                    <span
                      className={`font-medium ${formData.amount > (quota?.amount || 0) ? "text-success" : formData.amount < (quota?.amount || 0) ? "text-danger" : "text-default"}`}
                    >
                      {formData.amount > (quota?.amount || 0) ? "+" : ""}
                      {formatCurrency(formData.amount - (quota?.amount || 0))}
                    </span>
                  </div>
                  {quota?.payments && quota.payments.length > 0 && (
                    <div className="mt-3 p-2 bg-warning-50 rounded">
                      <p className="text-warning text-xs">
                        ⚠️ Esta cuota tiene pagos registrados. Cambiar el monto
                        puede afectar el estado de pago.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <ModalFooter>
              <Button variant="light" onPress={onClose}>
                Cancelar
              </Button>
              <Button
                color="primary"
                isDisabled={!isFormValid}
                isLoading={isLoading}
                type="submit"
              >
                Actualizar Cuota
              </Button>
            </ModalFooter>
          </Form>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
} 