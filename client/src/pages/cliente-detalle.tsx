import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { Button } from "@heroui/button";
import { Chip } from "@heroui/chip";
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell } from "@heroui/table";
import { Spinner } from "@heroui/spinner";
import { Divider } from "@heroui/divider";
import { Accordion, AccordionItem } from "@heroui/accordion";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from "@heroui/modal";
import { Input } from "@heroui/input";
import { DatePicker } from "@heroui/date-picker";
import { Tooltip } from "@heroui/tooltip";
import { addToast } from "@heroui/toast";
import { parseDate, getLocalTimeZone } from "@internationalized/date";
import {
  LiaUserSolid,
  LiaPhoneSolid,
  LiaEnvelopeSolid,
  LiaMapMarkerAltSolid,
  LiaCalendarAltSolid,
  LiaReceiptSolid,
  LiaMoneyBillWaveSolid, LiaFileInvoiceDollarSolid,
  LiaCreditCardSolid,
  LiaPlusSolid,
  LiaTrashAltSolid,
  LiaUserEditSolid, LiaEyeSolid,
  LiaEyeSlashSolid
} from "react-icons/lia";
import { RiEditLine, RiDeleteBinLine, RiShoppingBagLine } from "react-icons/ri";
import { api, ClientDetail } from "../api";
import DefaultLayout from "@/layouts/default";
import SaleForm from "@/components/SaleForm";
import ClientForm from "@/components/ClientForm";
import ConfirmModal from "@/components/ConfirmModal";

const statusColorMap = {
  1: "success",
  2: "warning", 
  3: "danger",
} as const;

const statusTextMap = {
  1: "Al día",
  2: "Advertencia",
  3: "Deudor",
} as const;

// Función para determinar el estado de una cuota basado en el estado del backend
const getQuotaStatus = (quota: any): { color: "success" | "primary" | "warning" | "danger" | "default" | "secondary", text: string } => {
  // Si está pagada, siempre es verde
  if (quota.is_paid) {
    return { color: "success", text: "Pagada" };
  }

  // Mapear estados del backend:
  // 1: Pendiente (azul)
  // 2: Advertencia (naranja) 
  // 3: Vencida (roja)
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

// Función para determinar el estado de una venta basado en el estado del backend
const getSaleStatus = (sale: any): { color: "success" | "primary" | "warning" | "danger" | "default" | "secondary", text: string } => {
  // Si está pagada, siempre es verde
  if (sale.is_paid) {
    return { color: "success", text: "Pagada" };
  }

  // Mapear estados del backend:
  // 1: Pendiente (azul)
  // 2: Advertencia (naranja) 
  // 3: Vencida (roja)
  switch (sale.state) {
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

// Componente para mostrar detalles de venta
function SaleDetails({ saleId }: { saleId: string }) {
  const queryClient = useQueryClient();
  const [isCostVisible, setIsCostVisible] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isDeletePaymentModalOpen, setIsDeletePaymentModalOpen] = useState(false);
  const [isEditQuotaModalOpen, setIsEditQuotaModalOpen] = useState(false);
  const [selectedQuota, setSelectedQuota] = useState<any>(null);
  const [selectedPayment, setSelectedPayment] = useState<any>(null);

  const { data: saleDetails, isLoading, error } = useQuery({
    queryKey: ["sale-details", saleId],
    queryFn: async () => {
      const response = await api.get(`/api/sales/${saleId}`);
      return response.data;
    },
    enabled: !!saleId,
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(amount);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Sin fecha";
    return new Date(dateString).toLocaleDateString('es-AR');
  };

  const handlePayment = (quota: any) => {
    setSelectedQuota(quota);
    setIsPaymentModalOpen(true);
  };

  const handleDeletePayment = (payment: any, quota: any) => {
    setSelectedPayment(payment);
    setSelectedQuota(quota);
    setIsDeletePaymentModalOpen(true);
  };

  const handleEditQuota = (quota: any) => {
    setSelectedQuota(quota);
    setIsEditQuotaModalOpen(true);
  };

  const handlePaymentSuccess = () => {
    // Invalidar la query para recargar los datos
    queryClient.invalidateQueries({ queryKey: ["sale-details", saleId] });
    // También invalidar la query del cliente para actualizar el estado general
    queryClient.invalidateQueries({ queryKey: ["client"] });
  };

  const handleDeletePaymentSuccess = () => {
    // Invalidar la query para recargar los datos
    queryClient.invalidateQueries({ queryKey: ["sale-details", saleId] });
    // También invalidar la query del cliente para actualizar el estado general
    queryClient.invalidateQueries({ queryKey: ["client"] });
  };

  const handleEditQuotaSuccess = () => {
    // Invalidar la query para recargar los datos
    queryClient.invalidateQueries({ queryKey: ["sale-details", saleId] });
    // También invalidar la query del cliente para actualizar el estado general
    queryClient.invalidateQueries({ queryKey: ["client"] });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <Spinner size="sm" />
        <span className="ml-2 text-sm text-default-500">Cargando detalles...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 text-danger">
        <p>Error al cargar los detalles de la venta</p>
      </div>
    );
  }

  if (!saleDetails) {
    return (
      <div className="text-center py-8 text-default-500">
        <p>No se encontraron detalles de la venta</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Información básica de la venta */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-default-50 rounded-lg">
        <div className="flex items-center gap-2">
          <LiaCalendarAltSolid className="text-default-500" />
          <div>
            <p className="text-sm text-default-500">Fecha</p>
            <p className="font-medium">
              {saleDetails.date ? formatDate(saleDetails.date) : "Sin fecha"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <LiaMoneyBillWaveSolid className="text-default-500" />
          <div>
            <p className="text-sm text-default-500">Monto total</p>
            <p className="font-medium">
              {saleDetails.amount ? formatCurrency(saleDetails.amount) : "Sin monto"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <LiaCreditCardSolid className="text-default-500" />
          <div>
            <p className="text-sm text-default-500">Cuotas</p>
            <p className="font-medium">
              {saleDetails.quotas?.length || 0} cuotas
            </p>
          </div>
        </div>
      </div>

      {/* Información adicional de la venta */}
      {saleDetails.quota_price && saleDetails.quotas && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-default-50 rounded-lg">
          <div className="flex items-center gap-2">
            <LiaCreditCardSolid className="text-default-500" />
            <div>
              <p className="text-sm text-default-500">Precio por cuota</p>
              <p className="font-medium">
                {formatCurrency(saleDetails.quota_price)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <LiaMoneyBillWaveSolid className="text-default-500" />
            <div>
              <p className="text-sm text-default-500">Total en cuotas</p>
              <p className="font-medium">
                {formatCurrency(saleDetails.quota_price * saleDetails.quotas.length)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Productos de la venta */}
      {saleDetails.products && saleDetails.products.length > 0 && (
          <div>
            <h4 className="font-medium mb-3 flex items-center gap-2">
              <RiShoppingBagLine />
              Productos
            </h4>
          <Table aria-label="Productos de la venta">
            <TableHeader>
              <TableColumn>Producto</TableColumn>
              <TableColumn>Cantidad</TableColumn>
              <TableColumn>
                <div className="flex items-center gap-1">
                  <span>Costo</span>
                  <Button 
                    isIconOnly 
                    size="sm" 
                    variant="light" 
                    onPress={() => setIsCostVisible(!isCostVisible)}
                  >
                    {isCostVisible ? <LiaEyeSlashSolid /> : <LiaEyeSolid />}
                  </Button>
                </div>
              </TableColumn>
              <TableColumn>Precio unitario</TableColumn>
              <TableColumn>Subtotal</TableColumn>
            </TableHeader>
            <TableBody>
              {saleDetails.products.map((product: any) => (
                <TableRow key={product.id}>
                  <TableCell>{product.name}</TableCell>
                  <TableCell>{product.quantity}</TableCell>
                  <TableCell>
                    {isCostVisible ? (
                      <span className="text-default-600">
                        {formatCurrency(product.cost || 0)}
                      </span>
                    ) : (
                      <span className="text-default-400">••••</span>
                    )}
                  </TableCell>
                  <TableCell>{formatCurrency(product.price)}</TableCell>
                  <TableCell>
                    {formatCurrency(product.price * product.quantity)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Tabla de cuotas */}
      {saleDetails.quotas && saleDetails.quotas.length > 0 && (
        <div>
          <h4 className="font-medium mb-3 flex items-center gap-2">
            <LiaCreditCardSolid />
            Cuotas
          </h4>
          <Table aria-label="Cuotas de la venta">
            <TableHeader>
              <TableColumn>Número</TableColumn>
              <TableColumn>Monto</TableColumn>
              <TableColumn>Vencimiento</TableColumn>
              <TableColumn>Estado</TableColumn>
              <TableColumn>Pagos</TableColumn>
              <TableColumn>Acciones</TableColumn>
            </TableHeader>
            <TableBody>
              {saleDetails.quotas.map((quota: any) => (
                <TableRow key={quota.id}>
                  <TableCell>
                    <span className="font-medium">#{quota.number}</span>
                  </TableCell>
                  <TableCell>
                    <span className="font-medium">
                      {formatCurrency(quota.amount)}
                    </span>
                  </TableCell>
                  <TableCell>
                    {quota.due_date ? formatDate(quota.due_date) : "Sin fecha"}
                  </TableCell>
                  <TableCell>
                    {(() => {
                      const status = getQuotaStatus(quota);
                      return (
                        <Chip 
                          color={status.color}
                          variant="flat"
                          size="sm"
                        >
                          {status.text}
                        </Chip>
                      );
                    })()}
                  </TableCell>
                  <TableCell>
                    {quota.payments && quota.payments.length > 0 ? (
                      <div className="space-y-1">
                        {quota.payments.map((payment: any) => (
                          <div key={payment.id} className="flex items-center gap-2 text-sm">
                            <LiaReceiptSolid className="text-success" />
                            <span>{formatCurrency(payment.amount)}</span>
                            <span className="text-default-500">
                              {payment.date ? formatDate(payment.date) : ""}
                            </span>
                            <Tooltip content="Eliminar pago">
                              <span className="text-lg text-danger cursor-pointer active:opacity-50">
                                <LiaTrashAltSolid onClick={() => handleDeletePayment(payment, quota)} />
                              </span>
                            </Tooltip>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <span className="text-default-500 text-sm">Sin pagos</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2 justify-center">
                      {!quota.is_paid && (
                        <Tooltip content="Realizar pago">
                          <span className="text-lg text-success cursor-pointer active:opacity-50">
                            <LiaReceiptSolid onClick={() => handlePayment(quota)} />
                          </span>
                        </Tooltip>
                      )}
                      <Tooltip content="Editar cuota">
                        <span className="text-lg text-primary cursor-pointer active:opacity-50">
                          <RiEditLine onClick={() => handleEditQuota(quota)} />
                        </span>
                      </Tooltip>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Modal de pago */}
      {isPaymentModalOpen && selectedQuota && (
        <PaymentModal
          isOpen={isPaymentModalOpen}
          onClose={() => {
            setIsPaymentModalOpen(false);
            setSelectedQuota(null);
          }}
          quota={selectedQuota}
          saleId={saleId}
          onSuccess={handlePaymentSuccess}
        />
      )}

      {/* Modal de confirmación para eliminar pago */}
      {isDeletePaymentModalOpen && selectedPayment && selectedQuota && (
        <DeletePaymentModal
          isOpen={isDeletePaymentModalOpen}
          onClose={() => {
            setIsDeletePaymentModalOpen(false);
            setSelectedPayment(null);
            setSelectedQuota(null);
          }}
          payment={selectedPayment}
          quota={selectedQuota}
          onSuccess={handleDeletePaymentSuccess}
        />
      )}

      {/* Modal de edición de cuota */}
      {isEditQuotaModalOpen && selectedQuota && (
        <EditQuotaModal
          isOpen={isEditQuotaModalOpen}
          onClose={() => {
            setIsEditQuotaModalOpen(false);
            setSelectedQuota(null);
          }}
          quota={selectedQuota}
          onSuccess={handleEditQuotaSuccess}
        />
      )}
    </div>
  );
}

// Componente para el modal de pago
function PaymentModal({ isOpen, onClose, quota, saleId, onSuccess }: { 
  isOpen: boolean; 
  onClose: () => void; 
  quota: any; 
  saleId: string; 
  onSuccess: () => void;
}) {
  const [amount, setAmount] = useState(quota?.amount || 0);
  const [date, setDate] = useState(parseDate(new Date().toISOString().split('T')[0]));
  const [isLoading, setIsLoading] = useState(false);

  // Calcular el monto pendiente real (total de la cuota menos pagos realizados)
  const calculatePendingAmount = () => {
    const totalQuotaAmount = quota?.amount || 0;
    const totalPaid = quota?.payments?.reduce((sum: number, payment: any) => sum + payment.amount, 0) || 0;
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
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
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
      addToast({
        title: "Monto inválido",
        description: `No puedes pagar más de ${formatCurrency(maxAmount)}`,
        color: "danger",
      });
      return;
    }
    
    setIsLoading(true);
    try {
      // Convertir la fecha del DatePicker a string ISO
      const paymentDate = date.toDate(getLocalTimeZone()).toISOString();
      
      await api.post(`/api/payments`, {
        quota_id: parseInt(quota.id.toString()),
        amount: amount,
        date: paymentDate
      });
      
      // Llamar a la función de éxito para actualizar los datos
      onSuccess();
      onClose();
      
      // Mostrar toast de éxito
      addToast({
        title: "Pago realizado",
        description: `Se ha registrado el pago de ${formatCurrency(amount)}`,
        color: "success",
      });
    } catch (error) {
      console.error('Error al crear el pago:', error);
      
      // Mostrar toast de error
      addToast({
        title: "Error al realizar el pago",
        description: "No se pudo registrar el pago. Inténtalo de nuevo.",
        color: "danger",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
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
                  <p className="font-medium">{formatCurrency(quota?.amount || 0)}</p>
                </div>
                <div>
                  <p className="text-default-500">Total pagado:</p>
                  <p className="font-medium text-success">
                    {formatCurrency(quota?.payments?.reduce((sum: number, payment: any) => sum + payment.amount, 0) || 0)}
                  </p>
                </div>
                <div>
                  <p className="text-default-500">Monto pendiente:</p>
                  <p className="font-medium text-warning">{formatCurrency(pendingAmount)}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Monto a pagar"
                labelPlacement="outside"
                placeholder="0.00"
                type="number"
                min="0"
                max={pendingAmount}
                step="0.01"
                value={amount.toString()}
                onChange={(e) => handleAmountChange(e.target.value)}
                startContent={
                  <div className="pointer-events-none flex items-center">
                    <span className="text-default-400 text-small">$</span>
                  </div>
                }
                description={`Máximo: ${formatCurrency(pendingAmount)}`}
                isInvalid={amount > pendingAmount}
                errorMessage={amount > pendingAmount ? `No puede exceder ${formatCurrency(pendingAmount)}` : ""}
              />
              
              <DatePicker
                label="Fecha de pago"
                labelPlacement="outside"
                value={date}
                onChange={(newDate) => {
                  if (newDate) {
                    setDate(newDate);
                  }
                }}
                startContent={<LiaCalendarAltSolid className="text-default-400" />}
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
            onPress={handleSubmit}
            isLoading={isLoading}
            isDisabled={amount <= 0 || amount > pendingAmount}
          >
            Realizar Pago
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

// Componente para el modal de confirmación de eliminación de pago
function DeletePaymentModal({ isOpen, onClose, payment, quota, onSuccess }: { 
  isOpen: boolean; 
  onClose: () => void; 
  payment: any; 
  quota: any; 
  onSuccess: () => void;
}) {
  const [isLoading, setIsLoading] = useState(false);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(amount);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Sin fecha";
    return new Date(dateString).toLocaleDateString('es-AR');
  };

  const handleDelete = async () => {
    setIsLoading(true);
    try {
      await api.delete(`/api/payments/${payment.id}`);
      
      // Llamar a la función de éxito para actualizar los datos
      onSuccess();
      onClose();
      
      // Mostrar toast de éxito
      addToast({
        title: "Pago eliminado",
        description: `Se ha eliminado el pago de ${formatCurrency(payment.amount)}`,
        color: "success",
      });
    } catch (error) {
      console.error('Error al eliminar el pago:', error);
      
      // Mostrar toast de error
      addToast({
        title: "Error al eliminar el pago",
        description: "No se pudo eliminar el pago. Inténtalo de nuevo.",
        color: "danger",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <LiaTrashAltSolid className="text-2xl text-danger" />
            <span>Eliminar Pago</span>
          </div>
        </ModalHeader>
        <ModalBody>
          <div className="space-y-4">
            <div className="p-4 bg-danger-50 rounded-lg">
              <h4 className="font-medium mb-2 text-danger">Confirmar Eliminación</h4>
              <p className="text-sm text-default-600">
                ¿Estás seguro de que quieres eliminar este pago? Esta acción no se puede deshacer.
              </p>
            </div>

            <div className="p-4 bg-default-50 rounded-lg">
              <h4 className="font-medium mb-2">Información del Pago</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-default-500">Cuota:</p>
                  <p className="font-medium">#{quota?.number}</p>
                </div>
                <div>
                  <p className="text-default-500">Monto del pago:</p>
                  <p className="font-medium text-danger">{formatCurrency(payment?.amount || 0)}</p>
                </div>
                <div>
                  <p className="text-default-500">Fecha del pago:</p>
                  <p className="font-medium">
                    {payment?.date ? formatDate(payment.date) : "Sin fecha"}
                  </p>
                </div>
                <div>
                  <p className="text-default-500">ID del pago:</p>
                  <p className="font-medium">#{payment?.id}</p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-warning-50 rounded-lg">
              <h4 className="font-medium mb-2 text-warning">Impacto de la Eliminación</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Monto total de la cuota:</span>
                  <span className="font-medium">{formatCurrency(quota?.amount || 0)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total pagado actualmente:</span>
                  <span className="font-medium text-success">
                    {formatCurrency(quota?.payments?.reduce((sum: number, p: any) => sum + p.amount, 0) || 0)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Quedará pendiente después de eliminar:</span>
                  <span className="font-medium text-warning">
                    {formatCurrency((quota?.payments?.reduce((sum: number, p: any) => sum + p.amount, 0) || 0) - (payment?.amount || 0))}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant="light" onPress={onClose}>
            Cancelar
          </Button>
          <Button
            color="danger"
            onPress={handleDelete}
            isLoading={isLoading}
          >
            Eliminar Pago
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

// Componente para el modal de edición de cuota
function EditQuotaModal({ isOpen, onClose, quota, onSuccess }: { 
  isOpen: boolean; 
  onClose: () => void; 
  quota: any; 
  onSuccess: () => void;
}) {
  const [amount, setAmount] = useState(quota?.amount || 0);
  const [dueDate, setDueDate] = useState(
    quota?.due_date ? parseDate(quota.due_date.split('T')[0]) : parseDate(new Date().toISOString().split('T')[0])
  );
  const [isLoading, setIsLoading] = useState(false);

  // Actualizar los valores cuando se abre el modal o cambia la cuota
  useEffect(() => {
    if (isOpen && quota) {
      setAmount(quota.amount || 0);
      if (quota.due_date) {
        setDueDate(parseDate(quota.due_date.split('T')[0]));
      } else {
        setDueDate(parseDate(new Date().toISOString().split('T')[0]));
      }
    }
  }, [isOpen, quota]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(amount);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Sin fecha";
    return new Date(dateString).toLocaleDateString('es-AR');
  };

  const handleSubmit = async () => {
    if (amount <= 0) {
      addToast({
        title: "Monto inválido",
        description: "El monto debe ser mayor a 0",
        color: "danger",
      });
      return;
    }
    
    setIsLoading(true);
    try {
      // Convertir la fecha del DatePicker a string ISO
      const quotaDueDate = dueDate.toDate(getLocalTimeZone()).toISOString();
      
      await api.put(`/api/quotas/${quota.id}`, {
        amount: amount,
        due_date: quotaDueDate
      });
      
      // Llamar a la función de éxito para actualizar los datos
      onSuccess();
      onClose();
      
      // Mostrar toast de éxito
      addToast({
        title: "Cuota actualizada",
        description: `Se ha actualizado la cuota #${quota.number}`,
        color: "success",
      });
    } catch (error) {
      console.error('Error al actualizar la cuota:', error);
      
      // Mostrar toast de error
      addToast({
        title: "Error al actualizar la cuota",
        description: "No se pudo actualizar la cuota. Inténtalo de nuevo.",
        color: "danger",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <RiEditLine className="text-2xl text-primary" />
            <span>Editar Cuota</span>
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
                  <p className="text-default-500">Estado:</p>
                  {(() => {
                    const status = getQuotaStatus(quota);
                    return (
                      <Chip 
                        color={status.color}
                        variant="flat"
                        size="sm"
                      >
                        {status.text}
                      </Chip>
                    );
                  })()}
                </div>
                <div>
                  <p className="text-default-500">Total pagado:</p>
                  <p className="font-medium text-success">
                    {formatCurrency(quota?.payments?.reduce((sum: number, payment: any) => sum + payment.amount, 0) || 0)}
                  </p>
                </div>
                <div>
                  <p className="text-default-500">Fecha de vencimiento actual:</p>
                  <p className="font-medium">
                    {quota?.due_date ? formatDate(quota.due_date) : "Sin fecha"}
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Monto de la cuota"
                labelPlacement="outside"
                placeholder="0.00"
                type="number"
                min="0"
                step="0.01"
                value={amount.toString()}
                onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                startContent={
                  <div className="pointer-events-none flex items-center">
                    <span className="text-default-400 text-small">$</span>
                  </div>
                }
                description="Monto total de la cuota"
              />
              
              <DatePicker
                label="Fecha de vencimiento"
                labelPlacement="outside"
                value={dueDate}
                onChange={(newDate) => {
                  if (newDate) {
                    setDueDate(newDate);
                  }
                }}
                startContent={<LiaCalendarAltSolid className="text-default-400" />}
              />
            </div>

            {/* Resumen de cambios */}
            <div className="p-4 bg-primary-50 rounded-lg">
              <h4 className="font-medium mb-2 text-primary">Resumen de Cambios</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Monto anterior:</span>
                  <span className="font-medium">{formatCurrency(quota?.amount || 0)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Monto nuevo:</span>
                  <span className="font-medium text-primary">{formatCurrency(amount)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Diferencia:</span>
                  <span className={`font-medium ${amount > (quota?.amount || 0) ? 'text-success' : amount < (quota?.amount || 0) ? 'text-danger' : 'text-default'}`}>
                    {amount > (quota?.amount || 0) ? '+' : ''}{formatCurrency(amount - (quota?.amount || 0))}
                  </span>
                </div>
                {quota?.payments && quota.payments.length > 0 && (
                  <div className="mt-3 p-2 bg-warning-50 rounded">
                    <p className="text-warning text-xs">
                      ⚠️ Esta cuota tiene pagos registrados. Cambiar el monto puede afectar el estado de pago.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant="light" onPress={onClose}>
            Cancelar
          </Button>
          <Button
            color="primary"
            onPress={handleSubmit}
            isLoading={isLoading}
            isDisabled={amount <= 0}
          >
            Actualizar Cuota
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

export default function ClienteDetallePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isSaleFormOpen, setIsSaleFormOpen] = useState(false);
  const [isEditFormOpen, setIsEditFormOpen] = useState(false);
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);

  // Query para obtener el detalle del cliente
  const { data: client, isLoading, error, refetch } = useQuery<ClientDetail>({
    queryKey: ["client", id],
    queryFn: async (): Promise<ClientDetail> => {
      const response = await api.get(`/api/clients/${id}`);
      return response.data;
    },
    enabled: !!id,
  });

  const editMutation = useMutation({
    mutationFn: (clientData: Omit<ClientDetail, 'id'>) => {
      if (!client) throw new Error("Client not found");
      return api.put(`/api/clients/${client.id}`, clientData);
    },
    onSuccess: () => {
      addToast({
        title: "Cliente actualizado",
        description: "Los datos del cliente se han actualizado correctamente.",
        color: "success",
      });
      queryClient.invalidateQueries({ queryKey: ["client", id] });
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      setIsEditFormOpen(false);
    },
    onError: (error) => {
      addToast({
        title: "Error al actualizar",
        description: "No se pudo actualizar el cliente.",
        color: "danger",
      });
      console.error("Error updating client:", error);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => {
      if (!client) throw new Error("Client not found");
      return api.delete(`/api/clients/${client.id}`);
    },
    onSuccess: () => {
      addToast({
        title: "Cliente eliminado",
        description: `El cliente ${client?.name} ${client?.lastname} ha sido eliminado.`,
        color: "success",
      });
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      setIsConfirmDeleteOpen(false);
      navigate("/clientes");
    },
    onError: (error) => {
      addToast({
        title: "Error al eliminar",
        description: "No se pudo eliminar el cliente.",
        color: "danger",
      });
      console.error("Error deleting client:", error);
      setIsConfirmDeleteOpen(false);
    },
  });

  const handleEdit = () => {
    setIsEditFormOpen(true);
  };

  const handleDelete = () => {
    setIsConfirmDeleteOpen(true);
  };

  const handleFormSubmit = async (clientData: Omit<ClientDetail, 'id'>) => {
    editMutation.mutate(clientData);
  };

  const handleConfirmDelete = async () => {
    deleteMutation.mutate();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(amount);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Sin fecha";
    return new Date(dateString).toLocaleDateString('es-AR');
  };

  if (isLoading) {
    return (
      <DefaultLayout>
        <div className="flex justify-center items-center h-64">
          <Spinner size="lg" />
        </div>
      </DefaultLayout>
    );
  }

  if (error) {
    return (
      <DefaultLayout>
        <div className="flex flex-col items-center justify-center h-64">
          <p className="text-danger">Error al cargar el cliente</p>
          <Button as={Link} to="/clientes" color="primary" variant="flat">
            Volver a clientes
          </Button>
        </div>
      </DefaultLayout>
    );
  }

  if (!client) {
    return (
      <DefaultLayout>
        <div className="flex flex-col items-center justify-center h-64">
          <p>Cliente no encontrado</p>
          <Button as={Link} to="/clientes" color="primary" variant="flat">
            Volver a clientes
          </Button>
        </div>
      </DefaultLayout>
    );
  }

  return (
    <DefaultLayout>
      <section className="flex flex-col gap-6">
        {/* Header con título y navegación */}
        <div className="flex items-center justify-between max-w-7xl w-full px-4">
          <div className="flex items-center gap-3">
            <Button as={Link} to="/clientes" variant="light" size="sm">
              ← Volver a clientes
            </Button>
            <div className="p-3 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl">
              <LiaUserSolid className="text-white text-2xl" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
                Detalle del Cliente
              </h1>
              <p className="text-default-500">Información completa y gestión del cliente</p>
            </div>
          </div>
          <div className="flex gap-2 items-center">
            <Tooltip content="Editar cliente">
              <Button
                isIconOnly
                size="sm"
                variant="flat"
                onPress={handleEdit}
              >
                <RiEditLine />
              </Button>
            </Tooltip>
            <Tooltip content="Eliminar cliente">
              <Button
                isIconOnly
                size="sm"
                variant="flat"
                color="danger"
                onPress={handleDelete}
              >
                <RiDeleteBinLine />
              </Button>
            </Tooltip>
          </div>
        </div>

        <div className="max-w-7xl w-full px-4">
          {/* Información del cliente */}
          <div className="bg-content1 border border-default-200 rounded-lg p-4 mb-4">
            <div className="flex gap-3 mb-4">
              <LiaUserSolid className="text-2xl text-primary" />
              <div className="flex flex-col flex-1">
                <p className="text-md font-semibold">
                  {client.name} {client.lastname}
                </p>
                <p className="text-small text-default-500">
                  Cliente #{client.id}
                </p>
              </div>
              <div className="flex gap-2 items-center -mt-4">
                <Chip 
                  className="capitalize" 
                  color={statusColorMap[client.state?.id as keyof typeof statusColorMap] || "default"} 
                  size="sm" 
                  variant="flat"
                >
                  {statusTextMap[client.state?.id as keyof typeof statusTextMap] || "Desconocido"}
                </Chip>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Primera columna - 3 datos */}
              <div className="flex items-center gap-3">
                <LiaUserSolid className="text-lg text-default-500" />
                <div>
                  <p className="text-sm text-default-500">DNI</p>
                  <p className="font-medium">{client.dni}</p>
                </div>
              </div>
              
              {client.email && (
                <div className="flex items-center gap-3">
                  <LiaEnvelopeSolid className="text-lg text-default-500" />
                  <div>
                    <p className="text-sm text-default-500">Email</p>
                    <p className="font-medium">{client.email}</p>
                  </div>
                </div>
              )}
              
              {client.phone && (
                <div className="flex items-center gap-3">
                  <LiaPhoneSolid className="text-lg text-default-500" />
                  <div>
                    <p className="text-sm text-default-500">Teléfono</p>
                    <p className="font-medium">{client.phone}</p>
                  </div>
                </div>
              )}
              
              {/* Cuarta columna - 1 dato */}
              {client.address && (
                <div className="flex items-center gap-3">
                  <LiaMapMarkerAltSolid className="text-lg text-default-500" />
                  <div>
                    <p className="text-sm text-default-500">Dirección</p>
                    <p className="font-medium">{client.address}</p>
                  </div>
                </div>
              )}
            </div>
          </div>


          {/* Lista de ventas */}
          <div className="bg-content1 border border-default-200 rounded-lg p-4">
          <div className="w-full flex justify-between">
            <div className="flex gap-3 mb-4">
              <LiaFileInvoiceDollarSolid className="text-2xl text-primary" />
              <div className="flex flex-col">
                <p className="text-md font-semibold">Ventas</p>
                <p className="text-small text-default-500">
                  {client.sales?.length || 0} ventas registradas
                </p>
              </div>
            </div>
                      {/* Botón Crear Venta - Separado en su propio bloque */}
          
            <Button 
              color="primary" 
              startContent={<LiaPlusSolid />}
              className="w-full sm:w-auto"
              size="sm"
              onPress={() => setIsSaleFormOpen(true)}
            >
              Crear Venta
            </Button>
          </div>
            {!client.sales || client.sales.length === 0 ? (
              <div className="text-center py-8 text-default-500">
                <LiaFileInvoiceDollarSolid className="text-4xl mx-auto mb-2" />
                <p>No hay ventas registradas para este cliente</p>
              </div>
            ) : (
              <Accordion 
                variant="splitted" 
                selectionMode="multiple"
                className="gap-2"
              >
                {client.sales.map((sale: any) => (
                  <AccordionItem
                    key={sale.id?.toString()}
                    aria-label={`Venta ${sale.description}`}
                    title={
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-3">
                          <LiaMoneyBillWaveSolid className="text-lg" />
                          <div className="text-left">
                            <p className="font-medium">{sale.description}</p>
                            <p className="text-sm text-default-500">
                              Venta #{sale.id}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {(() => {
                            const status = getSaleStatus(sale);
                            return (
                              <Chip 
                                color={status.color}
                                variant="flat"
                                size="sm"
                              >
                                {status.text}
                              </Chip>
                            );
                          })()}
                        </div>
                      </div>
                    }
                  >
                    <SaleDetails saleId={sale.id?.toString() || ''} />
                  </AccordionItem>
                ))}
              </Accordion>
            )}
          </div>
        </div>
      </section>

      {/* Modal de crear venta */}
      <SaleForm
        isOpen={isSaleFormOpen}
        onClose={() => setIsSaleFormOpen(false)}
        clientId={id || ""}
        clientName={`${client.name} ${client.lastname}`}
      />

      {isEditFormOpen && client && (
        <ClientForm
          isOpen={isEditFormOpen}
          onClose={() => setIsEditFormOpen(false)}
          onSubmit={handleFormSubmit}
          initialData={client}
          title={
            <div className="flex items-center gap-2">
              <LiaUserEditSolid className="text-2xl text-primary" />
              <span>Editar Cliente</span>
            </div>
          }
          submitText="Guardar Cambios"
          isLoading={editMutation.isPending}
        />
      )}

      {client && (
        <ConfirmModal
          isOpen={isConfirmDeleteOpen}
          onClose={() => setIsConfirmDeleteOpen(false)}
          onConfirm={handleConfirmDelete}
          title="Confirmar Eliminación"
          message={`¿Estás seguro de que quieres eliminar al cliente ${client.name} ${client.lastname}? Esta acción no se puede deshacer y eliminará todas sus ventas asociadas.`}
          isLoading={deleteMutation.isPending}
        />
      )}
    </DefaultLayout>
  );
} 