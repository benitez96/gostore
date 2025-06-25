import { useState } from "react";
import {
  RiShoppingBagLine,
  RiSearchLine,
  RiAddLine,
} from "react-icons/ri";
import { Input } from "@heroui/input";
import { Button } from "@heroui/button";

import { Product } from "@/types";
import DefaultLayout from "@/layouts/default";

import { useProducts, useProductStats } from "../hooks";
import { ProductForm, StockUpdateModal, ProductStats, ProductsTable } from "../components";

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
          <ProductsTable
            products={products}
            isLoading={isLoading}
            hasMore={hasMore}
            loaderRef={loaderRef}
            scrollerRef={scrollerRef}
            onEditProduct={handleEditProduct}
            onDeleteProduct={handleDeleteProduct}
            onUpdateStock={handleOpenStockModal}
          />

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