import { title, subtitle } from "@/components/primitives";
import DefaultLayout from "@/layouts/default";
import { RiShoppingBagLine } from "react-icons/ri";

export default function ProductosPage() {
  return (
    <DefaultLayout>
      <section className="flex flex-col items-center justify-center gap-4 py-8 md:py-10">
        <div className="inline-block max-w-lg text-center justify-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <RiShoppingBagLine className="text-3xl text-primary" />
            <h1 className={title()}>Productos</h1>
          </div>
          <div className={subtitle({ class: "mt-4" })}>
            Administración de tu catálogo de productos
          </div>
        </div>

        <div className="max-w-4xl w-full px-4">
          <div className="bg-content1 border border-default-200 rounded-lg p-8 text-center">
            <p className="text-default-500">
              Aquí podrás administrar tu catálogo de productos, precios e inventario.
            </p>
            <p className="text-sm text-default-400 mt-2">
              Funcionalidad de productos en desarrollo...
            </p>
          </div>
        </div>
      </section>
    </DefaultLayout>
  );
} 