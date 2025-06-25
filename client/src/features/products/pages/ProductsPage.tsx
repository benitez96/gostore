import { useState } from "react";
import {
  RiShoppingBagLine,
  RiSearchLine,
  RiEditLine,
  RiDeleteBinLine,
  RiAddLine,
  RiStockLine,
} from "react-icons/ri";
import { Input } from "@heroui/input";
import { Button } from "@heroui/button";
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

import { Product } from "@/types";
import DefaultLayout from "@/layouts/default";
import { formatCurrency } from "@/shared/utils/formatters";

import { useProducts, useProductStats } from "../hooks";
import { ProductForm, StockUpdateModal, ProductStats } from "../components";

export default function ProductsPage() {
  const [isProductFormOpen, setIsProductFormOpen] = useState(false);
  const [isStockModalOpen, setIsStockModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [stockProduct, setStockProduct] = useState<Product | null>(null);

  // Hook para las estadísticas de productos
  const { showStats, productStats, statsLoading } = useProductStats();

  // Use the products hook
  const {
    search,
    setSearch,
    items: products,
    isLoading,
    hasMore,
    totalProducts,
    loaderRef,
    scrollerRef,
    createProduct,
    updateProduct,
    updateStock,
    deleteProduct,
    isCreating,
    isUpdating,
    isUpdatingStock,
  } = useProducts();

  const handleCreateProduct = async (productData: any) => {
    try {
      await createProduct.mutateAsync(productData);
      setIsProductFormOpen(false);
      setEditingProduct(null);
    } catch (error) {
      // Error already handled in the hook
    }
  };

  const handleUpdateProduct = async (productData: any) => {
    if (!editingProduct) return;
    
    try {
      await updateProduct.mutateAsync({
        id: editingProduct.id,
        productData,
      });
      setIsProductFormOpen(false);
      setEditingProduct(null);
    } catch (error) {
      // Error already handled in the hook
    }
  };

  const handleUpdateStock = async (stockData: any) => {
    if (!stockProduct) return;
    
    try {
      await updateStock.mutateAsync({
        id: stockProduct.id,
        stockData,
        product: stockProduct,
      });
      setIsStockModalOpen(false);
      setStockProduct(null);
    } catch (error) {
      // Error already handled in the hook
    }
  };

  const handleDeleteProduct = async (product: Product) => {
    if (window.confirm(`¿Estás seguro de que deseas eliminar "${product.name}"?`)) {
      try {
        await deleteProduct.mutateAsync(product.id);
      } catch (error) {
        // Error already handled in the hook
      }
    }
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setIsProductFormOpen(true);
  };

  const handleOpenCreateForm = () => {
    setEditingProduct(null);
    setIsProductFormOpen(true);
  };

  const handleCloseProductForm = () => {
    setIsProductFormOpen(false);
    setEditingProduct(null);
  };

  const handleOpenStockModal = (product: Product) => {
    setStockProduct(product);
    setIsStockModalOpen(true);
  };

  const handleCloseStockModal = () => {
    setIsStockModalOpen(false);
    setStockProduct(null);
  };

  const getStockColor = (stock: number) => {
    if (stock <= 0) return "danger";
    if (stock <= 5) return "warning";
    return "success";
  };

  const getStockText = (stock: number) => {
    if (stock <= 0) return "Sin stock";
    if (stock <= 5) return "Stock bajo";
    return "En stock";
  };

  const columns = [
    { name: "PRODUCTO", uid: "name" },
    { name: "PRECIO", uid: "price" },
    { name: "COSTO", uid: "cost" },
    { name: "STOCK", uid: "stock" },
    { name: "ACCIONES", uid: "actions" },
  ];

  const renderCell = (product: Product, columnKey: React.Key) => {
    const cellValue = product[columnKey as keyof Product];

    switch (columnKey) {
      case "name":
        return (
          <div className="text-sm font-medium text-default-900">
            {product.name}
          </div>
        );
      case "price":
        return (
          <div className="text-sm text-default-900">
            {formatCurrency(product.price)}
          </div>
        );
      case "cost":
        return (
          <div className="text-sm text-default-600">
            {formatCurrency(product.cost)}
          </div>
        );
      case "stock":
        return (
          <Chip
            color={getStockColor(product.stock)}
            size="sm"
            variant="flat"
          >
            {product.stock} - {getStockText(product.stock)}
          </Chip>
        );
      case "actions":
        return (
          <div className="flex gap-2 justify-center">
            <Tooltip content="Actualizar stock">
              <span className="text-lg text-default-400 cursor-pointer active:opacity-50">
                <RiStockLine onClick={() => handleOpenStockModal(product)} />
              </span>
            </Tooltip>
            <Tooltip content="Editar">
              <span className="text-lg text-default-400 cursor-pointer active:opacity-50">
                <RiEditLine onClick={() => handleEditProduct(product)} />
              </span>
            </Tooltip>
            <Tooltip content="Eliminar">
              <span className="text-lg text-danger cursor-pointer active:opacity-50">
                <RiDeleteBinLine onClick={() => handleDeleteProduct(product)} />
              </span>
            </Tooltip>
          </div>
        );
      default:
        return typeof cellValue === "object" ? "" : cellValue;
    }
  };

  return (
    <DefaultLayout>
      <section className="flex flex-col gap-6">
        {/* Header con título y botón de crear */}
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
                Gestiona tu inventario de productos
              </p>
            </div>
          </div>
          <Button
            className="font-medium"
            color="success"
            startContent={<RiAddLine />}
            variant="flat"
            onPress={handleOpenCreateForm}
          >
            Crear Producto
          </Button>
        </div>

        <div className="max-w-7xl w-full px-4">
          {/* Top Content */}
          <div className="flex flex-col gap-4 mb-6">
            <div className="flex gap-3 items-end">
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

          {/* Products Table */}
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
              emptyContent="No se encontraron productos"
              isLoading={isLoading}
              items={products}
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

          {/* Estadísticas de productos */}
          {showStats && (
            <ProductStats 
              productStats={productStats}
              isLoading={statsLoading}
            />
          )}
        </div>

        {/* Product Form Modal */}
        <ProductForm
          isOpen={isProductFormOpen}
          onClose={handleCloseProductForm}
          onSubmit={editingProduct ? handleUpdateProduct : handleCreateProduct}
          initialData={editingProduct || undefined}
          title={editingProduct ? "Editar Producto" : "Crear Producto"}
          submitText={editingProduct ? "Actualizar" : "Crear"}
          isLoading={isCreating || isUpdating}
        />

        {/* Stock Update Modal */}
        <StockUpdateModal
          isOpen={isStockModalOpen}
          onClose={handleCloseStockModal}
          onSubmit={handleUpdateStock}
          product={stockProduct}
          isLoading={isUpdatingStock}
        />
      </section>
    </DefaultLayout>
  );
} 