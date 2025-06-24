import { useState, useEffect, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Spinner } from "@heroui/spinner";
import { Tooltip } from "@heroui/tooltip";
import { Chip } from "@heroui/chip";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
} from "@heroui/table";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@heroui/modal";
import { Accordion, AccordionItem } from "@heroui/accordion";
import { useAsyncList, AsyncListLoadOptions } from "@react-stately/data";
import { useInfiniteScroll } from "@heroui/use-infinite-scroll";
import { addToast } from "@heroui/toast";
import {
  RiShoppingBagLine,
  RiSearchLine,
  RiEditLine,
  RiDeleteBinLine,
  RiAddLine,
  RiInformationLine,
  RiMoneyDollarCircleLine,
  RiStockLine,
  RiCalendarLine,
  RiRefreshLine,
} from "react-icons/ri";
import axios from "axios";

import { useCatalogStatsShortcut } from "../hooks/useShortcut";
import { Product, ProductStats } from "../types";
import { api } from "../api";

import ConfirmModal from "@/components/ConfirmModal";
import DefaultLayout from "@/layouts/default";

interface ProductFormData {
  name: string;
  cost: number;
  price: number;
  stock: number;
}

interface StockUpdateData {
  stock: number;
}

interface ProductFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (product: ProductFormData) => Promise<void>;
  initialData?: Partial<Product>;
  title: string;
  submitText: string;
  isLoading?: boolean;
}

interface StockUpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: StockUpdateData) => Promise<void>;
  product?: Product | null;
  isLoading?: boolean;
}

function StockUpdateModal({
  isOpen,
  onClose,
  onSubmit,
  product,
  isLoading,
}: StockUpdateModalProps) {
  const [stock, setStock] = useState(0);

  useEffect(() => {
    if (product) {
      setStock(product.stock);
    }
  }, [product, isOpen]);

  const handleSubmit = () => {
    if (stock < 0) {
      addToast({
        title: "Error",
        description: "El stock no puede ser negativo",
        color: "danger",
      });

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

function ProductForm({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  title,
  submitText,
  isLoading,
}: ProductFormProps) {
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
      addToast({
        title: "Error",
        description: "El nombre del producto es requerido",
        color: "danger",
      });

      return;
    }

    if (formData.cost < 0 || formData.price < 0 || formData.stock < 0) {
      addToast({
        title: "Error",
        description: "Los valores no pueden ser negativos",
        color: "danger",
      });

      return;
    }

    onSubmit(formData);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
    }).format(amount);
  };

  const profit = formData.price - formData.cost;
  const profitMargin = formData.cost > 0 ? (profit / formData.price) * 100 : 0;

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
          <div className="space-y-4">
            <Input
              isRequired
              label="Nombre del producto"
              labelPlacement="outside"
              placeholder="Ej: Lavarropas automático"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                label="Costo"
                labelPlacement="outside"
                min="0"
                placeholder="0.00"
                startContent={
                  <div className="pointer-events-none flex items-center">
                    <span className="text-default-400 text-small">$</span>
                  </div>
                }
                step="0.01"
                type="number"
                value={formData.cost.toString()}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    cost: parseFloat(e.target.value) || 0,
                  })
                }
              />

              <Input
                label="Precio de venta"
                labelPlacement="outside"
                min="0"
                placeholder="0.00"
                startContent={
                  <div className="pointer-events-none flex items-center">
                    <span className="text-default-400 text-small">$</span>
                  </div>
                }
                step="0.01"
                type="number"
                value={formData.price.toString()}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    price: parseFloat(e.target.value) || 0,
                  })
                }
              />

              <Input
                label="Stock disponible"
                labelPlacement="outside"
                min="0"
                placeholder="0"
                type="number"
                value={formData.stock.toString()}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    stock: parseInt(e.target.value) || 0,
                  })
                }
              />
            </div>

            {/* Resumen de ganancias */}
            <div className="p-4 bg-default-50 rounded-lg space-y-2">
              <h4 className="font-medium flex items-center gap-2">
                <RiInformationLine className="text-primary" />
                Resumen de ganancias
              </h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-default-600">Ganancia por unidad:</span>
                  <span
                    className={`font-medium ${profit >= 0 ? "text-success" : "text-danger"}`}
                  >
                    {formatCurrency(profit)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-default-600">Margen de ganancia:</span>
                  <span
                    className={`font-medium ${profitMargin >= 0 ? "text-success" : "text-danger"}`}
                  >
                    {profitMargin.toFixed(2)}%
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
          <Button color="primary" isLoading={isLoading} onPress={handleSubmit}>
            {submitText}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

export default function ProductosPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [totalProducts, setTotalProducts] = useState(0);
  const [isCreateFormOpen, setIsCreateFormOpen] = useState(false);
  const [isEditFormOpen, setIsEditFormOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [isStockUpdateModalOpen, setIsStockUpdateModalOpen] = useState(false);
  const [productToUpdateStock, setProductToUpdateStock] =
    useState<Product | null>(null);
  const [showStats, setShowStats] = useState(false);

  // Hook para el shortcut de estadísticas del catálogo
  useCatalogStatsShortcut(() => {
    setShowStats((prev) => !prev);
  });

  // Query para obtener estadísticas de productos
  const { data: productStats, isLoading: statsLoading } =
    useQuery<ProductStats>({
      queryKey: ["product-stats"],
      queryFn: async () => {
        const response = await api.get("/api/products-stats");

        return response.data;
      },
    });

  const loadProducts = useCallback(
    async ({
      signal,
      cursor,
      filterText,
    }: AsyncListLoadOptions<Product, string>) => {
      try {
        const page = cursor ? parseInt(cursor, 10) : 1;
        const limit = 10;
        const offset = (page - 1) * limit;

        const response = await api.get("/api/products", {
          params: {
            offset,
            limit,
            search: filterText,
          },
          signal,
        });

        // Handle both paginated and non-paginated responses
        let products: Product[];
        let count: number;

        if (response.data.results) {
          // Paginated response
          products = response.data.results || [];
          count = response.data.count || 0;
        } else {
          // Non-paginated response (fallback)
          products = Array.isArray(response.data) ? response.data : [];
          count = products.length;
        }

        setHasMore(count > page * limit);
        setTotalProducts(count);

        return {
          items: products,
          cursor: count > page * limit ? (page + 1).toString() : undefined,
        };
      } catch (error) {
        if (axios.isCancel(error)) {
          return { items: [], cursor: undefined };
        }

        console.error("Error loading products:", error);
        addToast({
          title: "Error al cargar productos",
          description:
            "No se pudieron cargar los productos. Inténtalo de nuevo.",
          color: "danger",
        });

        return {
          items: [],
          cursor: undefined,
        };
      } finally {
        if (!cursor) {
          setIsLoading(false);
        }
      }
    },
    [],
  );

  const list = useAsyncList<Product>({
    load: loadProducts,
    getKey: (item: Product) => item.id,
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      list.setFilterText(search);
    }, 500);

    return () => clearTimeout(timer);
  }, [search]);

  const [loaderRef, scrollerRef] = useInfiniteScroll({
    hasMore,
    onLoadMore: list.loadMore,
  });

  // Mutations
  const createProductMutation = useMutation({
    mutationFn: async (productData: ProductFormData) => {
      const response = await api.post("/api/products", productData);

      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["product-stats"] });
      list.reload();
      setIsCreateFormOpen(false);
      addToast({
        title: "Producto creado",
        description: "El producto se ha creado exitosamente",
        color: "success",
      });
    },
    onError: (error: any) => {
      console.error("Error creating product:", error);
      addToast({
        title: "Error al crear producto",
        description: "No se pudo crear el producto. Inténtalo de nuevo.",
        color: "danger",
      });
    },
  });

  const updateProductMutation = useMutation({
    mutationFn: async ({
      id,
      productData,
    }: {
      id: string;
      productData: ProductFormData;
    }) => {
      const response = await api.put(`/api/products/${id}`, productData);

      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["product-stats"] });
      list.reload();
      setIsEditFormOpen(false);
      setSelectedProduct(null);
      addToast({
        title: "Producto actualizado",
        description: "El producto se ha actualizado exitosamente",
        color: "success",
      });
    },
    onError: (error: any) => {
      console.error("Error updating product:", error);
      addToast({
        title: "Error al actualizar producto",
        description: "No se pudo actualizar el producto. Inténtalo de nuevo.",
        color: "danger",
      });
    },
  });

  const updateStockMutation = useMutation({
    mutationFn: async ({
      id,
      stockData,
    }: {
      id: string;
      stockData: StockUpdateData;
    }) => {
      if (!productToUpdateStock) {
        throw new Error("Producto no encontrado");
      }

      const updatedProductData = {
        name: productToUpdateStock.name,
        cost: productToUpdateStock.cost,
        price: productToUpdateStock.price,
        stock: stockData.stock,
      };

      const response = await api.put(`/api/products/${id}`, updatedProductData);

      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["product-stats"] });
      list.reload();
      setIsStockUpdateModalOpen(false);
      setProductToUpdateStock(null);
      addToast({
        title: "Stock actualizado",
        description: "El stock se ha actualizado exitosamente",
        color: "success",
      });
    },
    onError: (error: any) => {
      console.error("Error updating stock:", error);
      addToast({
        title: "Error al actualizar stock",
        description: "No se pudo actualizar el stock. Inténtalo de nuevo.",
        color: "danger",
      });
    },
  });

  const deleteProductMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/api/products/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["product-stats"] });
      list.reload();
      setIsDeleteModalOpen(false);
      setProductToDelete(null);
      addToast({
        title: "Producto eliminado",
        description: "El producto se ha eliminado exitosamente",
        color: "success",
      });
    },
    onError: (error: any) => {
      console.error("Error deleting product:", error);
      addToast({
        title: "Error al eliminar producto",
        description: "No se pudo eliminar el producto. Inténtalo de nuevo.",
        color: "danger",
      });
    },
  });

  const handleOpenCreateForm = () => {
    setIsCreateFormOpen(true);
  };

  const handleOpenEditForm = (product: Product) => {
    setSelectedProduct(product);
    setIsEditFormOpen(true);
  };

  const handleOpenDeleteModal = (product: Product) => {
    setProductToDelete(product);
    setIsDeleteModalOpen(true);
  };

  const handleOpenStockUpdateModal = (product: Product) => {
    setProductToUpdateStock(product);
    setIsStockUpdateModalOpen(true);
  };

  const handleCreateProduct = async (productData: ProductFormData) => {
    await createProductMutation.mutateAsync(productData);
  };

  const handleUpdateProduct = async (productData: ProductFormData) => {
    if (selectedProduct) {
      await updateProductMutation.mutateAsync({
        id: selectedProduct.id.toString(),
        productData,
      });
    }
  };

  const handleUpdateStock = async (stockData: StockUpdateData) => {
    if (productToUpdateStock) {
      await updateStockMutation.mutateAsync({
        id: productToUpdateStock.id.toString(),
        stockData,
      });
    }
  };

  const handleDeleteProduct = async () => {
    if (productToDelete) {
      await deleteProductMutation.mutateAsync(productToDelete.id.toString());
    }
  };

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

  const columns = [
    { name: "PRODUCTO", uid: "name" },
    { name: "COSTO", uid: "cost" },
    { name: "PRECIO", uid: "price" },
    { name: "STOCK", uid: "stock" },
    { name: "MARGEN", uid: "margin" },
    { name: "ACTUALIZADO", uid: "updated_at" },
    { name: "ACCIONES", uid: "actions" },
  ];

  const renderCell = useCallback((product: Product, columnKey: React.Key) => {
    const cellValue = product[columnKey as keyof Product];

    switch (columnKey) {
      case "name":
        return (
          <div className="flex flex-col">
            <p className="text-bold">{product.name}</p>
            <p className="text-tiny capitalize text-default-400">
              ID: {product.id}
            </p>
          </div>
        );
      case "cost":
        return (
          <span className="text-default-600">
            {formatCurrency(product.cost)}
          </span>
        );
      case "price":
        return (
          <span className="font-medium">{formatCurrency(product.price)}</span>
        );
      case "stock":
        return (
          <Chip
            color={
              product.stock > 10
                ? "success"
                : product.stock > 0
                  ? "warning"
                  : "danger"
            }
            size="sm"
            variant="flat"
          >
            {product.stock} unidades
          </Chip>
        );
      case "margin":
        return (
          <div className="flex flex-col">
            <span
              className={`font-medium ${product.price - product.cost >= 0 ? "text-success" : "text-danger"}`}
            >
              {formatCurrency(product.price - product.cost)}
            </span>
            <span className="text-tiny text-default-400">
              {product.cost > 0
                ? (
                    ((product.price - product.cost) / product.price) *
                    100
                  ).toFixed(1)
                : 0}
              %
            </span>
          </div>
        );
      case "updated_at":
        return (
          <span className="text-default-500 text-sm">
            {formatDate(product.updated_at)}
          </span>
        );
      case "actions":
        return (
          <div className="flex gap-2 justify-center">
            <Tooltip content="Actualizar stock">
              <span className="text-lg text-default-400 cursor-pointer active:opacity-50">
                <RiRefreshLine
                  onClick={() => handleOpenStockUpdateModal(product)}
                />
              </span>
            </Tooltip>
            <Tooltip content="Editar">
              <span className="text-lg text-default-400 cursor-pointer active:opacity-50">
                <RiEditLine onClick={() => handleOpenEditForm(product)} />
              </span>
            </Tooltip>
            <Tooltip content="Eliminar">
              <span className="text-lg text-danger cursor-pointer active:opacity-50">
                <RiDeleteBinLine
                  onClick={() => handleOpenDeleteModal(product)}
                />
              </span>
            </Tooltip>
          </div>
        );
      default:
        return typeof cellValue === "object" ? "" : cellValue;
    }
  }, []);

  return (
    <DefaultLayout>
      <section className="flex flex-col gap-6">
        {/* Header con título y botón de refresh */}
        <div className="flex items-center justify-between max-w-7xl w-full px-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl">
              <RiShoppingBagLine className="text-white text-2xl" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
                Productos
              </h1>
              <p className="text-default-500">
                Administra tu catálogo de productos
              </p>
            </div>
          </div>
        </div>

        <div className="max-w-7xl w-full px-4">
          {/* Top Content */}
          <div className="flex justify-between">
            <div className="flex flex-col gap-4 mb-6 w-full">
              <div className="flex justify-between gap-3 items-end">
                <Input
                  isClearable
                  className="w-full sm:max-w-[44%]"
                  placeholder="Buscar productos..."
                  startContent={<RiSearchLine className="text-default-400" />}
                  value={search}
                  onValueChange={setSearch}
                />
              </div>
              <div className="flex justify-between items-center">
                <span className="text-default-400 text-small">
                  Total {totalProducts} productos
                </span>
              </div>
            </div>
            <div className="flex justify-end items-end pb-6">
              <Button
                className="font-medium w-full sm:w-auto"
                color="primary"
                startContent={<RiAddLine />}
                variant="flat"
                onPress={handleOpenCreateForm}
              >
                Crear Producto
              </Button>
            </div>
          </div>

          {/* HeroUI Table with Infinite Scroll */}
          <Table
            isHeaderSticky
            aria-label="Tabla de productos"
            baseRef={scrollerRef}
            bottomContent={
              hasMore ? (
                <div className="flex w-full justify-center">
                  <Spinner
                    ref={loaderRef}
                    classNames={{ label: "text-foreground mt-4" }}
                    variant="wave"
                  />
                </div>
              ) : null
            }
            classNames={{
              base: "max-h-[calc(100dvh-250px)] overflow-hidden",
              td: "py-4",
            }}
          >
            <TableHeader columns={columns}>
              {(column) => (
                <TableColumn
                  key={column.uid}
                  align={column.uid === "actions" ? "center" : "start"}
                >
                  {column.name}
                </TableColumn>
              )}
            </TableHeader>
            <TableBody
              emptyContent={
                <div className="text-center py-8">
                  <RiShoppingBagLine className="text-4xl mx-auto mb-2 text-default-400" />
                  <p className="text-default-500">
                    No se encontraron productos
                  </p>
                </div>
              }
              isLoading={isLoading}
              items={list.items}
              loadingContent={
                <Spinner
                  classNames={{ label: "text-foreground mt-4" }}
                  variant="wave"
                />
              }
            >
              {(item: Product) => (
                <TableRow key={item.id}>
                  {(columnKey) => (
                    <TableCell>{renderCell(item, columnKey)}</TableCell>
                  )}
                </TableRow>
              )}
            </TableBody>
          </Table>

          {/* Estadísticas con Accordion */}
          {showStats && (
            <div className="mt-6">
              <Accordion className="gap-2 px-0" variant="splitted">
                <AccordionItem
                  key="stats"
                  aria-label="Estadísticas de productos"
                  title={
                    <div className="flex items-center gap-2">
                      <RiInformationLine className="text-primary" />
                      <span>Estadísticas del catálogo</span>
                    </div>
                  }
                >
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4 p-4">
                    <div className="bg-default-50 rounded-lg p-4 text-center">
                      <RiShoppingBagLine className="text-2xl text-primary mx-auto mb-2" />
                      <p className="text-2xl font-bold">
                        {statsLoading
                          ? "..."
                          : productStats?.total_products || 0}
                      </p>
                      <p className="text-sm text-default-500">
                        Total productos
                      </p>
                    </div>

                    <div className="bg-default-50 rounded-lg p-4 text-center">
                      <RiMoneyDollarCircleLine className="text-2xl text-danger mx-auto mb-2" />
                      <p className="text-2xl font-bold text-danger">
                        {statsLoading
                          ? "..."
                          : formatCurrency(productStats?.total_cost || 0)}
                      </p>
                      <p className="text-sm text-default-500">Costo total</p>
                    </div>

                    <div className="bg-default-50 rounded-lg p-4 text-center">
                      <RiMoneyDollarCircleLine className="text-2xl text-success mx-auto mb-2" />
                      <p className="text-2xl font-bold text-success">
                        {statsLoading
                          ? "..."
                          : formatCurrency(productStats?.total_value || 0)}
                      </p>
                      <p className="text-sm text-default-500">Valor total</p>
                    </div>

                    <div className="bg-default-50 rounded-lg p-4 text-center">
                      <RiStockLine className="text-2xl text-warning mx-auto mb-2" />
                      <p className="text-2xl font-bold text-warning">
                        {statsLoading ? "..." : productStats?.total_stock || 0}
                      </p>
                      <p className="text-sm text-default-500">Stock total</p>
                    </div>

                    <div className="bg-default-50 rounded-lg p-4 text-center">
                      <RiCalendarLine className="text-2xl text-secondary mx-auto mb-2" />
                      <p className="text-2xl font-bold text-secondary">
                        {statsLoading
                          ? "..."
                          : productStats?.out_of_stock_count || 0}
                      </p>
                      <p className="text-sm text-default-500">Sin stock</p>
                    </div>
                  </div>
                </AccordionItem>
              </Accordion>
            </div>
          )}
        </div>
      </section>

      {/* Modals */}
      <ProductForm
        isLoading={createProductMutation.isPending}
        isOpen={isCreateFormOpen}
        submitText="Crear Producto"
        title="Crear Producto"
        onClose={() => setIsCreateFormOpen(false)}
        onSubmit={handleCreateProduct}
      />

      <ProductForm
        initialData={selectedProduct || undefined}
        isLoading={updateProductMutation.isPending}
        isOpen={isEditFormOpen}
        submitText="Actualizar Producto"
        title="Editar Producto"
        onClose={() => {
          setIsEditFormOpen(false);
          setSelectedProduct(null);
        }}
        onSubmit={handleUpdateProduct}
      />

      <StockUpdateModal
        isLoading={updateStockMutation.isPending}
        isOpen={isStockUpdateModalOpen}
        product={productToUpdateStock}
        onClose={() => {
          setIsStockUpdateModalOpen(false);
          setProductToUpdateStock(null);
        }}
        onSubmit={handleUpdateStock}
      />

      <ConfirmModal
        cancelText="Cancelar"
        confirmText="Eliminar"
        isLoading={deleteProductMutation.isPending}
        isOpen={isDeleteModalOpen}
        message={`¿Estás seguro de que quieres eliminar el producto "${productToDelete?.name}"?\n\nEsta acción no se puede deshacer.`}
        title="Eliminar Producto"
        onClose={() => {
          setIsDeleteModalOpen(false);
          setProductToDelete(null);
        }}
        onConfirm={handleDeleteProduct}
      />
    </DefaultLayout>
  );
}
