import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from "@heroui/modal";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Select, SelectItem } from "@heroui/select";
import { DatePicker } from "@heroui/date-picker";
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell } from "@heroui/table";
import { Chip } from "@heroui/chip";
import { Spinner } from "@heroui/spinner";
import { Divider } from "@heroui/divider";
import { parseDate, getLocalTimeZone } from "@internationalized/date";
import { 
  LiaMoneyBillWaveSolid,
  LiaCalendarAltSolid,
  LiaCreditCardSolid,
  LiaPlusSolid,
  LiaTrashSolid,
  LiaTimesSolid,
  LiaEditSolid,
  LiaEyeSolid,
  LiaEyeSlashSolid,
} from "react-icons/lia";
import { api } from "../api";
import { Product, SaleFormData, SaleFormProduct, CreateSaleDto } from "../types";

interface SaleFormProps {
  isOpen: boolean;
  onClose: () => void;
  clientId: string;
  clientName: string;
}

export default function SaleForm({ isOpen, onClose, clientId, clientName }: SaleFormProps) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<SaleFormData>({
    date: new Date().toISOString().split('T')[0],
    quotas: 1,
    quota_price: 0,
    products: []
  });

  const [selectedProductId, setSelectedProductId] = useState<string>("");
  const [productQuantity, setProductQuantity] = useState<number>(1);
  const [manualProduct, setManualProduct] = useState({
    name: "",
    cost: 0,
    price: 0,
    quantity: 1
  });
  const [isManualMode, setIsManualMode] = useState(false);
  const [isQuotaPriceManuallyEdited, setIsQuotaPriceManuallyEdited] = useState(false);
  const [isCostVisible, setIsCostVisible] = useState(false);

  // Query para obtener productos
  const { data: products, isLoading: loadingProducts } = useQuery({
    queryKey: ["products"],
    queryFn: async (): Promise<Product[]> => {
      const response = await api.get("/api/products");
      return response.data;
    },
    enabled: isOpen,
  });

  // Mutation para crear venta
  const createSaleMutation = useMutation({
    mutationFn: async (saleData: CreateSaleDto) => {
      const response = await api.post("/api/sales", saleData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["client", clientId] });
      onClose();
      resetForm();
    },
    onError: (error: any) => {
      console.error("Error creating sale:", error);
      // TODO: Mostrar toast de error
    }
  });

  const resetForm = () => {
    setFormData({
      date: new Date().toISOString().split('T')[0],
      quotas: 1,
      quota_price: 0,
      products: []
    });
    setSelectedProductId("");
    setProductQuantity(1);
    setManualProduct({
      name: "",
      cost: 0,
      price: 0,
      quantity: 1
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
        is_manual: true
      };

      setFormData({
        ...formData,
        products: [...formData.products, newProduct]
      });

      // Reset manual product form
      setManualProduct({
        name: "",
        cost: 0,
        price: 0,
        quantity: 1
      });
    } else {
      // Agregar producto seleccionado
      if (!selectedProductId || productQuantity <= 0) return;

      const product = products?.find(p => p.id.toString() === selectedProductId);
      if (!product) return;

      // Verificar si el producto ya está en la lista
      const existingProductIndex = formData.products.findIndex(
        p => p.product_id === selectedProductId
      );

      if (existingProductIndex >= 0) {
        // Actualizar cantidad del producto existente
        const updatedProducts = [...formData.products];
        updatedProducts[existingProductIndex].quantity += productQuantity;
        setFormData({
          ...formData,
          products: updatedProducts
        });
      } else {
        // Agregar nuevo producto
        const newProduct: SaleFormProduct = {
          product_id: selectedProductId,
          product_name: product.name,
          quantity: productQuantity,
          price: product.price,
          cost: product.cost,
          stock: product.stock,
          is_manual: false
        };

        setFormData({
          ...formData,
          products: [...formData.products, newProduct]
        });
      }

      setSelectedProductId("");
      setProductQuantity(1);
    }
  };

  const removeProduct = (productId: string) => {
    setIsQuotaPriceManuallyEdited(false);
    setFormData({
      ...formData,
      products: formData.products.filter(p => p.product_id !== productId)
    });
  };

  const updateProductQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) return;

    setIsQuotaPriceManuallyEdited(false);
    setFormData({
      ...formData,
      products: formData.products.map(p => 
        p.product_id === productId ? { ...p, quantity } : p
      )
    });
  };

  const updateProductPrice = (productId: string, price: number) => {
    if (price < 0) return;

    setIsQuotaPriceManuallyEdited(false);
    setFormData({
      ...formData,
      products: formData.products.map(p => 
        p.product_id === productId ? { ...p, price } : p
      )
    });
  };

  const updateProductCost = (productId: string, cost: number) => {
    if (cost < 0) return;

    setIsQuotaPriceManuallyEdited(false);
    setFormData({
      ...formData,
      products: formData.products.map(p => 
        p.product_id === productId ? { ...p, cost } : p
      )
    });
  };

  const updateProductName = (productId: string, name: string) => {
    if (!name.trim()) return;

    setIsQuotaPriceManuallyEdited(false);
    setFormData({
      ...formData,
      products: formData.products.map(p => 
        p.product_id === productId ? { ...p, product_name: name } : p
      )
    });
  };

  const calculateTotal = () => {
    return formData.products.reduce((total, product) => {
      return total + (product.price * product.quantity);
    }, 0);
  };

  useEffect(() => {
    if (!isQuotaPriceManuallyEdited) {
      const total = calculateTotal();
      const newQuotaPrice = total > 0 && formData.quotas > 0 ? Math.round((total / formData.quotas) * 100) / 100 : 0;
      setFormData(prev => ({ ...prev, quota_price: newQuotaPrice }));
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

    const totalSale = formData.quota_price * formData.quotas;

    const saleData: CreateSaleDto = {
      amount: totalSale,
      client_id: parseInt(clientId),
      date: `${formData.date}T12:00:00Z`,
      quotas: formData.quotas,
      quota_price: formData.quota_price,
      products: formData.products.map(p => ({
        id: p.is_manual ? 0 : parseInt(p.product_id), // 0 para productos manuales
        name: p.product_name,
        cost: p.cost,
        price: p.price,
        quantity: p.quantity
      }))
    };

    createSaleMutation.mutate(saleData);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(amount);
  };

  const productsTotal = calculateTotal();
  const totalSale = formData.quota_price * formData.quotas;
  const interestAmount = totalSale - productsTotal;
  const interestPercentage = productsTotal > 0 ? (interestAmount / productsTotal) * 100 : 0;

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="4xl" scrollBehavior="inside">
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <LiaMoneyBillWaveSolid className="text-2xl text-primary" />
            <span>Crear Venta</span>
          </div>
          <p className="text-sm text-default-500">
            Cliente: {clientName}
          </p>
        </ModalHeader>
        <ModalBody>
          <div className="space-y-4">
            {/* Información básica */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium text-default-700 mb-2 block">
                  Fecha
                </label>
                <DatePicker
                  value={parseDate(formData.date)}
                  onChange={(date) => {
                    if (date) {
                      const dateString = date.toDate(getLocalTimeZone()).toISOString().split('T')[0];
                      setFormData({ 
                        ...formData, 
                        date: dateString
                      });
                    }
                  }}
                  startContent={<LiaCalendarAltSolid className="text-default-400" />}
                />
              </div>
              
              <div>
                <label className="text-sm font-medium text-default-700 mb-2 block">
                  Número de Cuotas
                </label>
                <Input
                  type="number"
                  min="1"
                  value={formData.quotas.toString()}
                  onChange={(e) => {
                    setIsQuotaPriceManuallyEdited(false);
                    setFormData({ ...formData, quotas: parseInt(e.target.value) || 1 })
                  }}
                  startContent={<LiaCreditCardSolid className="text-default-400" />}
                />
              </div>
              
              <div>
                <label className="text-sm font-medium text-default-700 mb-2 block">
                  Precio por Cuota
                </label>
                <Input
                  type="number"
                  min="0"
                  step="1"
                  value={formData.quota_price.toString()}
                  onChange={(e) => {
                    setIsQuotaPriceManuallyEdited(true);
                    setFormData({ ...formData, quota_price: parseFloat(e.target.value) || 0 })
                  }}
                  startContent={
                    <div className="pointer-events-none flex items-center">
                      <span className="text-default-400 text-small">$</span>
                    </div>
                  }
                />
              </div>
            </div>

            {/* Agregar productos */}
            <div className="border border-default-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium">Agregar Productos</h3>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant={!isManualMode ? "solid" : "bordered"}
                    color="primary"
                    onPress={() => setIsManualMode(false)}
                  >
                    Seleccionar Producto
                  </Button>
                  <Button
                    size="sm"
                    variant={isManualMode ? "solid" : "bordered"}
                    color="secondary"
                    onPress={() => setIsManualMode(true)}
                  >
                    Producto Manual
                  </Button>
                </div>
              </div>

              {isManualMode ? (
                // Formulario para producto manual
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                  <Input
                    label="Nombre del producto"
                    labelPlacement="outside"
                    placeholder="Ej: Lavarropas automatico"
                    value={manualProduct.name}
                    onChange={(e) => setManualProduct({ ...manualProduct, name: e.target.value })}
                  />
                  <Input
                    label="Costo"
                    labelPlacement="outside"
                    placeholder="0.00"
                    type="number"
                    min="0"
                    step="0.01"
                    value={manualProduct.cost.toString()}
                    onChange={(e) => setManualProduct({ ...manualProduct, cost: parseFloat(e.target.value) || 0 })}
                    startContent={
                      <div className="pointer-events-none flex items-center">
                        <span className="text-default-400 text-small">$</span>
                      </div>
                    }
                  />
                  <Input
                    label="Precio"
                    labelPlacement="outside"
                    placeholder="0.00"
                    type="number"
                    min="0"
                    step="0.01"
                    value={manualProduct.price.toString()}
                    onChange={(e) => setManualProduct({ ...manualProduct, price: parseFloat(e.target.value) || 0 })}
                    startContent={
                      <div className="pointer-events-none flex items-center">
                        <span className="text-default-400 text-small">$</span>
                      </div>
                    }
                  />
                  <Input
                    label="Cantidad"
                    labelPlacement="outside"
                    placeholder="1"
                    type="number"
                    min="1"
                    value={manualProduct.quantity.toString()}
                    onChange={(e) => setManualProduct({ ...manualProduct, quantity: parseInt(e.target.value) || 1 })}
                  />
                </div>
              ) : (
                // Formulario para seleccionar producto
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <Input
                    label="Buscar producto"
                    labelPlacement="outside"
                    placeholder="Escribe el nombre del producto..."
                    value={selectedProductId}
                    onChange={(e) => setSelectedProductId(e.target.value)}
                    isDisabled={loadingProducts}
                    list="products-list"
                  />
                  <datalist id="products-list">
                    {products && products.map((product) => (
                      <option key={product.id} value={product.id.toString()}>
                        {product.name} - Stock: {product.stock}
                      </option>
                    ))}
                  </datalist>
                  
                  <Input
                    label="Cantidad"
                    labelPlacement="outside"
                    placeholder="1"
                    type="number"
                    min="1"
                    value={productQuantity.toString()}
                    onChange={(e) => setProductQuantity(parseInt(e.target.value) || 1)}
                  />
                </div>
              )}
              
              <Button
                color="primary"
                startContent={<LiaPlusSolid />}
                onPress={addProduct}
                isDisabled={
                  isManualMode 
                    ? (!manualProduct.name.trim() || manualProduct.quantity <= 0)
                    : (!selectedProductId || productQuantity <= 0)
                }
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
                        <Button isIconOnly size="sm" variant="light" onPress={() => setIsCostVisible(!isCostVisible)}>
                          {isCostVisible ? <LiaEyeSlashSolid /> : <LiaEyeSolid />}
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
                            placeholder="Nombre del producto"
                            value={product.product_name}
                            onChange={(e) => updateProductName(product.product_id, e.target.value)}
                            className="w-full"
                            endContent={
                              product.is_manual ? (
                                <Chip size="sm" color="secondary" variant="flat">
                                  Manual
                                </Chip>
                              ) : null
                            }
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            placeholder="1"
                            type="number"
                            min="1"
                            max={product.is_manual ? undefined : product.stock}
                            value={product.quantity.toString()}
                            onChange={(e) => updateProductQuantity(product.product_id, parseInt(e.target.value) || 1)}
                            className="w-20"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            placeholder="0.00"
                            type={isCostVisible ? "number" : "password"}
                            min="0"
                            step="1"
                            value={product.cost.toString()}
                            onChange={(e) => updateProductCost(product.product_id, parseFloat(e.target.value) || 0)}
                            startContent={
                              <div className="pointer-events-none flex items-center">
                                <span className="text-default-400 text-small">$</span>
                              </div>
                            }
                            className="w-24"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            placeholder="0.00"
                            type="number"
                            min="0"
                            step="1"
                            value={product.price.toString()}
                            onChange={(e) => updateProductPrice(product.product_id, parseFloat(e.target.value) || 0)}
                            startContent={
                              <div className="pointer-events-none flex items-center">
                                <span className="text-default-400 text-small">$</span>
                              </div>
                            }
                            className="w-24"
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
                            size="sm"
                            color="danger"
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
                    <span className="font-semibold text-foreground">{formatCurrency(productsTotal)}</span>
                  </div>
                  <div className="flex justify-between items-center text-default-600">
                    <span>No. Cuotas:</span>
                    <span className="font-semibold text-foreground">{formData.quotas}</span>
                  </div>
                  <div className="flex justify-between items-center text-default-600">
                    <span>Monto por Cuota:</span>
                    <span className="font-semibold text-foreground">{formatCurrency(formData.quota_price)}</span>
                  </div>
                   <div className="flex justify-between items-center text-default-600">
                    <span>Interés Agregado:</span>
                    <span className="font-semibold text-success">
                      +{formatCurrency(interestAmount)} ({interestPercentage.toFixed(2)}%)
                    </span>
                  </div>
                  <Divider />
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold">Total de la Venta:</span>
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
            onPress={handleSubmit}
            isLoading={createSaleMutation.isPending}
            isDisabled={formData.products.length === 0}
          >
            Crear Venta
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
} 