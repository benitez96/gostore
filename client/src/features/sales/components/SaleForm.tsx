import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@heroui/modal";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";

import { DatePicker } from "@heroui/date-picker";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
} from "@heroui/table";
import { Chip } from "@heroui/chip";
import { Divider } from "@heroui/divider";

import { parseDate, getLocalTimeZone } from "@internationalized/date";
import {
  LiaMoneyBillWaveSolid,
  LiaCalendarAltSolid,
  LiaCreditCardSolid,
  LiaPlusSolid,
  LiaTrashSolid,
  LiaEyeSolid,
  LiaEyeSlashSolid,
} from "react-icons/lia";

import { api } from "@/api";
import {
  Product,
  SaleFormProduct,
  CreateSaleDto,
} from "@/types";
import { formatCurrency } from "@/shared/utils/formatters";
import { CurrencyInput } from "@/shared/components/ui";
import ProductSelector from "./ProductSelector";

interface SaleFormProps {
  isOpen: boolean;
  onClose: () => void;
  clientId: string;
  clientName: string;
}

interface SaleFormState {
  date: string;
  quotas: number;
  quota_price: number;
  products: SaleFormProduct[];
}

export default function SaleForm({
  isOpen,
  onClose,
  clientId,
  clientName,
}: SaleFormProps) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<SaleFormState>({
    date: new Date().toISOString().split("T")[0],
    quotas: 1,
    quota_price: 0,
    products: [],
  });

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [productQuantity, setProductQuantity] = useState<number>(1);
  const [manualProduct, setManualProduct] = useState({
    name: "",
    cost: 0,
    price: 0,
    quantity: 1,
  });
  const [isManualMode, setIsManualMode] = useState(false);
  const [isQuotaPriceManuallyEdited, setIsQuotaPriceManuallyEdited] =
    useState(false);
  const [isCostVisible, setIsCostVisible] = useState(false);



  // Mutation para crear venta
  const createSaleMutation = useMutation({
    mutationFn: async (saleData: CreateSaleDto) => {
      const response = await api.post("/api/sales", saleData);
      return response.data;
    },
    onSuccess: () => {
      // Invalidar tanto la query con string como con número
      queryClient.invalidateQueries({ queryKey: ["client", clientId] });
      queryClient.invalidateQueries({ queryKey: ["client", parseInt(clientId)] });
      queryClient.invalidateQueries({ queryKey: ["client"] });
      onClose();
      resetForm();
    },
    onError: (error: any) => {
      console.error("Error creating sale:", error);
    },
  });

  const resetForm = () => {
    setFormData({
      date: new Date().toISOString().split("T")[0],
      quotas: 1,
      quota_price: 0,
      products: [],
    });
    setSelectedProduct(null);
    setProductQuantity(1);
    setManualProduct({
      name: "",
      cost: 0,
      price: 0,
      quantity: 1,
    });
    setIsManualMode(false);
    setIsQuotaPriceManuallyEdited(false);
    setIsCostVisible(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const addProduct = () => {
    setIsQuotaPriceManuallyEdited(false);
    if (isManualMode) {
      // Agregar producto manual
      if (!manualProduct.name.trim() || manualProduct.quantity <= 0) return;

      const newProduct: SaleFormProduct = {
        product_id: `manual_${Date.now()}`, // ID único para productos manuales
        product_name: manualProduct.name,
        quantity: manualProduct.quantity,
        price: manualProduct.price,
        cost: manualProduct.cost,
        stock: 0, // Productos manuales no tienen stock
        is_manual: true,
      };

      setFormData({
        ...formData,
        products: [...formData.products, newProduct],
      });

      // Reset manual product form
      setManualProduct({
        name: "",
        cost: 0,
        price: 0,
        quantity: 1,
      });
    } else {
      // Agregar producto seleccionado
      if (!selectedProduct || productQuantity <= 0) return;

      // Verificar si el producto ya está en la lista
      const existingProductIndex = formData.products.findIndex(
        (p) => p.product_id === selectedProduct.id.toString(),
      );

      if (existingProductIndex >= 0) {
        // Actualizar cantidad del producto existente
        const updatedProducts = [...formData.products];

        updatedProducts[existingProductIndex].quantity += productQuantity;
        setFormData({
          ...formData,
          products: updatedProducts,
        });
      } else {
        // Agregar nuevo producto
        const newProduct: SaleFormProduct = {
          product_id: selectedProduct.id.toString(),
          product_name: selectedProduct.name,
          quantity: productQuantity,
          price: selectedProduct.price,
          cost: selectedProduct.cost,
          stock: selectedProduct.stock,
          is_manual: false,
        };

        setFormData({
          ...formData,
          products: [...formData.products, newProduct],
        });
      }

      // Reset form
      setSelectedProduct(null);
      setProductQuantity(1);
    }
  };

  const removeProduct = (productId: string) => {
    setIsQuotaPriceManuallyEdited(false);
    setFormData({
      ...formData,
      products: formData.products.filter((p) => p.product_id !== productId),
    });
  };

  const updateProductQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) return;

    setIsQuotaPriceManuallyEdited(false);
    setFormData({
      ...formData,
      products: formData.products.map((p) =>
        p.product_id === productId ? { ...p, quantity } : p,
      ),
    });
  };

  const updateProductPrice = (productId: string, price: number) => {
    if (price < 0) return;

    setIsQuotaPriceManuallyEdited(false);
    setFormData({
      ...formData,
      products: formData.products.map((p) =>
        p.product_id === productId ? { ...p, price } : p,
      ),
    });
  };

  const updateProductCost = (productId: string, cost: number) => {
    if (cost < 0) return;

    setIsQuotaPriceManuallyEdited(false);
    setFormData({
      ...formData,
      products: formData.products.map((p) =>
        p.product_id === productId ? { ...p, cost } : p,
      ),
    });
  };

  const updateProductName = (productId: string, name: string) => {
    if (!name.trim()) return;

    setIsQuotaPriceManuallyEdited(false);
    setFormData({
      ...formData,
      products: formData.products.map((p) =>
        p.product_id === productId ? { ...p, product_name: name } : p,
      ),
    });
  };

  const calculateTotal = () => {
    return formData.products.reduce((total, product) => {
      return total + product.price * product.quantity;
    }, 0);
  };

  useEffect(() => {
    if (!isQuotaPriceManuallyEdited) {
      const total = calculateTotal();
      const newQuotaPrice =
        total > 0 && formData.quotas > 0
          ? Math.round((total / formData.quotas) * 100) / 100
          : 0;

      setFormData((prev) => ({ ...prev, quota_price: newQuotaPrice }));
    }
  }, [formData.products, formData.quotas, isQuotaPriceManuallyEdited]);

  const handleSubmit = () => {
    if (formData.products.length === 0) {
      // TODO: Mostrar error - debe tener al menos un producto
      return;
    }

    if (formData.quotas <= 0) {
      // TODO: Mostrar error - debe tener al menos una cuota
      return;
    }

    // Usar quota_price como number
    const quotaPriceNumber = formData.quota_price || 0;
    const totalSale = quotaPriceNumber * formData.quotas;

    const saleData: CreateSaleDto = {
      amount: totalSale,
      client_id: parseInt(clientId),
      date: `${formData.date}T12:00:00Z`,
      quotas: formData.quotas,
      quota_price: quotaPriceNumber, // Enviar como number a la API
      products: formData.products.map((p) => ({
        id: p.is_manual ? 0 : parseInt(p.product_id), // 0 para productos manuales
        name: p.product_name,
        cost: p.cost,
        price: p.price,
        quantity: p.quantity,
      })),
    };

    createSaleMutation.mutate(saleData);
  };



  const productsTotal = calculateTotal();
  // Usar quota_price como number para cálculos
  const quotaPriceNumber = formData.quota_price || 0;
  const totalSale = quotaPriceNumber * formData.quotas;
  const interestAmount = totalSale - productsTotal;
  const interestPercentage =
    productsTotal > 0 ? (interestAmount / productsTotal) * 100 : 0;

  return (
    <Modal
      isOpen={isOpen}
      scrollBehavior="inside"
      size="5xl"
      onClose={handleClose}
    >
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <LiaMoneyBillWaveSolid className="text-2xl text-primary" />
            <span>Crear Venta</span>
          </div>
          <p className="text-sm text-default-500">Cliente: {clientName}</p>
        </ModalHeader>
        <ModalBody>
          <div className="space-y-4">
            {/* Información básica */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <DatePicker
                  label="Fecha"
                  labelPlacement="outside"
                  startContent={
                    <LiaCalendarAltSolid className="text-default-400" />
                  }
                  value={parseDate(formData.date)}
                  onChange={(date) => {
                    if (date) {
                      const dateString = date
                        .toDate(getLocalTimeZone())
                        .toISOString()
                        .split("T")[0];

                      setFormData({
                        ...formData,
                        date: dateString,
                      });
                    }
                  }}
                />
              </div>

              <div>
                <Input
                  label="Número de cuotas"
                  labelPlacement="outside"
                  min="1"
                  type="number"
                  placeholder="1"
                  value={formData.quotas > 0 ? formData.quotas.toString() : ""}
                  onChange={e => {
                    setIsQuotaPriceManuallyEdited(false);
                    setFormData({
                      ...formData,
                      quotas: parseInt(e.target.value) || 0,
                    });
                  }}
                  startContent={<LiaCreditCardSolid className="text-default-400" />}
                />
              </div>

              <div>
                <CurrencyInput
                  label="Precio de la cuota"
                  labelPlacement="outside"
                  value={formData.quota_price}
                  onValueChange={(value) => {
                    setIsQuotaPriceManuallyEdited(true);
                    setFormData({
                      ...formData,
                      quota_price: value || 0,
                    });
                  }}
                  placeholder="0.00"
                  isClearable
                  min={0}
                />
              </div>
            </div>

            {/* Agregar productos */}
            <div className="border border-default-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium">Agregar Productos</h3>
                <div className="flex gap-2">
                  <Button
                    color="primary"
                    size="sm"
                    variant={!isManualMode ? "solid" : "bordered"}
                    onPress={() => setIsManualMode(false)}
                  >
                    Seleccionar Producto
                  </Button>
                  <Button
                    color="secondary"
                    size="sm"
                    variant={isManualMode ? "solid" : "bordered"}
                    onPress={() => setIsManualMode(true)}
                  >
                    Producto Manual
                  </Button>
                </div>
              </div>

              {isManualMode ? (
                // Formulario para producto manual
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4 items-end">
                  <Input
                    label="Nombre del producto"
                    labelPlacement="outside"
                    placeholder="Ej: Lavarropas automatico"
                    value={manualProduct.name}
                    onChange={(e) =>
                      setManualProduct({
                        ...manualProduct,
                        name: e.target.value,
                      })
                    }
                  />
                  <CurrencyInput
                    label="Costo"
                    labelPlacement="outside"
                    placeholder="0.00"
                    value={manualProduct.cost}
                    onValueChange={(value) =>
                      setManualProduct({
                        ...manualProduct,
                        cost: value || 0,
                      })
                    }
                    min={0}
                    isClearable
                  />
                  <CurrencyInput
                    label="Precio"
                    labelPlacement="outside"
                    placeholder="0.00"
                    value={manualProduct.price}
                    onValueChange={(value) =>
                      setManualProduct({
                        ...manualProduct,
                        price: value || 0,
                      })
                    }
                    min={0}
                    isClearable
                  />
                  <Input
                    label="Cantidad"
                    labelPlacement="outside"
                    min="1"
                    placeholder="1"
                    type="number"
                    value={manualProduct.quantity.toString()}
                    onChange={(e) =>
                      setManualProduct({
                        ...manualProduct,
                        quantity: parseInt(e.target.value) || 1,
                      })
                    }
                  />
                </div>
              ) : (
                // Formulario para seleccionar producto
                <ProductSelector
                  selectedProductId={selectedProduct?.id.toString() || ""}
                  productQuantity={productQuantity}
                  onProductSelect={setSelectedProduct}
                  onQuantityChange={setProductQuantity}
                />
              )}

              <Button
                color="primary"
                isDisabled={
                  isManualMode
                    ? !manualProduct.name.trim() || manualProduct.quantity <= 0
                    : !selectedProduct || productQuantity <= 0
                }
                startContent={<LiaPlusSolid />}
                onPress={addProduct}
              >
                Agregar Producto
              </Button>
            </div>

            {/* Lista de productos */}
            {formData.products.length > 0 && (
              <div className="border border-default-200 rounded-lg p-4">
                <h3 className="font-medium mb-4">Productos de la Venta</h3>
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
                          {isCostVisible ? (
                            <LiaEyeSlashSolid />
                          ) : (
                            <LiaEyeSolid />
                          )}
                        </Button>
                      </div>
                    </TableColumn>
                    <TableColumn>Precio Unitario</TableColumn>
                    <TableColumn>Subtotal</TableColumn>
                    <TableColumn>Acciones</TableColumn>
                  </TableHeader>
                  <TableBody>
                    {formData.products.map((product) => (
                      <TableRow key={product.product_id}>
                        <TableCell>
                          <Input
                            className="w-full"
                            endContent={
                              product.is_manual ? (
                                <Chip
                                  color="secondary"
                                  size="sm"
                                  variant="flat"
                                >
                                  Manual
                                </Chip>
                              ) : null
                            }
                            placeholder="Nombre del producto"
                            value={product.product_name}
                            onChange={(e) =>
                              updateProductName(
                                product.product_id,
                                e.target.value,
                              )
                            }
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            className="w-20"
                            max={product.is_manual ? undefined : product.stock}
                            min="1"
                            placeholder="1"
                            type="number"
                            value={product.quantity.toString()}
                            onChange={(e) =>
                              updateProductQuantity(
                                product.product_id,
                                parseInt(e.target.value) || 1,
                              )
                            }
                          />
                        </TableCell>
                        <TableCell>
                          <div className={isCostVisible ? "" : "relative"}>
                            <CurrencyInput
                              value={product.cost}
                              onValueChange={(value) =>
                                updateProductCost(
                                  product.product_id,
                                  value || 0,
                                )
                              }
                              placeholder="0.00"
                              min={0}
                            />
                            {!isCostVisible && (
                              <div className="absolute inset-0 bg-default-100 rounded-medium flex items-center justify-center">
                                <span className="text-default-400 text-xs">****</span>
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <CurrencyInput
                            value={product.price}
                            onValueChange={(value) =>
                              updateProductPrice(
                                product.product_id,
                                value || 0,
                              )
                            }
                            placeholder="0.00"
                            min={0}
                          />
                        </TableCell>
                        <TableCell>
                          <span className="font-medium">
                            {formatCurrency(product.price * product.quantity)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Button
                            isIconOnly
                            color="danger"
                            size="sm"
                            variant="light"
                            onPress={() => removeProduct(product.product_id)}
                          >
                            <LiaTrashSolid />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                <div className="mt-6 p-4 bg-default-50 rounded-lg space-y-3">
                  <div className="flex justify-between items-center text-default-600">
                    <span>Total Productos:</span>
                    <span className="font-semibold text-foreground">
                      {formatCurrency(productsTotal)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-default-600">
                    <span>No. Cuotas:</span>
                    <span className="font-semibold text-foreground">
                      {formData.quotas}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-default-600">
                    <span>Monto por Cuota:</span>
                    <span className="font-semibold text-foreground">
                      {formatCurrency(quotaPriceNumber)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-default-600">
                    <span>Interés Agregado:</span>
                    <span className="font-semibold text-success">
                      +{formatCurrency(interestAmount)} (
                      {interestPercentage.toFixed(2)}%)
                    </span>
                  </div>
                  <Divider />
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold">
                      Total de la Venta:
                    </span>
                    <span className="text-2xl font-bold text-primary">
                      {formatCurrency(totalSale)}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant="light" onPress={handleClose}>
            Cancelar
          </Button>
          <Button
            color="primary"
            isDisabled={
              formData.products.length === 0 || 
              formData.quotas <= 0 || 
              quotaPriceNumber <= 0
            }
            isLoading={createSaleMutation.isPending}
            onPress={handleSubmit}
          >
            Crear Venta
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
