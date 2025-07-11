import { useState } from "react";
import { Autocomplete, AutocompleteItem } from "@heroui/autocomplete";
import { useInfiniteScroll } from "@heroui/use-infinite-scroll";
import { Input } from "@heroui/input";
import { LiaSearchSolid } from "react-icons/lia";
import { Product } from "@/types";
import { formatCurrency } from "@/shared/utils/formatters";
import { useDebounce } from "@/shared/hooks";
import { useProductList } from "../hooks";


interface ProductSelectorProps {
  selectedProductId: string;
  productQuantity: number;
  onProductSelect: (product: Product | null) => void;
  onQuantityChange: (quantity: number) => void;
}

export default function ProductSelector({
  selectedProductId,
  productQuantity,
  onProductSelect,
  onQuantityChange,
}: ProductSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [productSearch, setProductSearch] = useState<string>("");
  
  // Debounce search term to avoid excessive API calls
  const debouncedSearch = useDebounce(productSearch, 400);
  
  // Use our custom hook similar to the Pokemon example
  const { items: products, hasMore, isLoading, onLoadMore } = useProductList({
    searchTerm: debouncedSearch,
    fetchDelay: 200, // Reducido ya que ya tenemos debounce
  });

  // Infinite scroll setup
  const [, scrollerRef] = useInfiniteScroll({
    hasMore,
    isEnabled: isOpen,
    shouldUseLoader: false, // We don't want to show the loader at the bottom of the list
    onLoadMore,
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
      <Autocomplete
        label="Buscar y seleccionar producto"
        labelPlacement="outside"
        placeholder="Escribe para buscar productos..."
        selectedKey={selectedProductId}
        inputValue={productSearch}
        defaultItems={products}
        isVirtualized={false}
        isLoading={isLoading}
        scrollRef={scrollerRef}
        onInputChange={setProductSearch}
        onSelectionChange={(key) => {
          const selectedKey = key as string;
          if (selectedKey) {
            const selectedProduct = products.find((p: Product) => p.id.toString() === selectedKey);
            if (selectedProduct) {
              setProductSearch(selectedProduct.name);
              onProductSelect(selectedProduct);
            } else {
              onProductSelect(null);
            }
          } else {
            onProductSelect(null);
          }
        }}
        onOpenChange={setIsOpen}
        startContent={<LiaSearchSolid className="text-default-400" />}
        allowsCustomValue={false}
      >
        {(product) => (
          <AutocompleteItem
            key={product.id.toString()}
            textValue={product.name}
          >
            <div className="flex flex-col justify-center h-full overflow-hidden">
              <div className="font-medium text-sm truncate leading-tight">
                {product.name}
              </div>
              <div className="text-xs text-default-500 truncate leading-tight">
                Stock: {product.stock} | Precio: {formatCurrency(product.price)}
              </div>
            </div>
          </AutocompleteItem>
        )}
      </Autocomplete>

      <Input
        label="Cantidad"
        labelPlacement="outside"
        min="1"
        placeholder="1"
        type="number"
        value={productQuantity.toString()}
        onChange={(e) =>
          onQuantityChange(parseInt(e.target.value) || 1)
        }
      />
    </div>
  );
} 