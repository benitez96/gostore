import { Button } from "@heroui/button";
import { Link } from "@heroui/link";
import {
  RiDonutChartLine,
  RiUserLine,
  RiShoppingBagLine,
  RiHomeLine,
} from "react-icons/ri";

import DefaultLayout from "@/layouts/default";

export default function IndexPage() {
  const cards = [
    {
      title: "Clientes",
      description:
        "Gestiona tu base de datos de clientes, contactos y información",
      href: "/clientes",
      color: "secondary" as const,
      icon: RiUserLine,
    },
    {
      title: "Productos",
      description: "Administra tu catálogo de productos, precios y inventario",
      href: "/productos",
      color: "success" as const,
      icon: RiShoppingBagLine,
    },
    {
      title: "Dashboard",
      description:
        "Vista general de tu negocio con estadísticas y métricas importantes",
      href: "/dashboard",
      color: "primary" as const,
      icon: RiDonutChartLine,
    },
  ];

  return (
    <DefaultLayout>
      <section className="flex flex-col gap-6">
        {/* Header con título */}
        <div className="flex items-center justify-center max-w-7xl w-full px-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl">
              <RiHomeLine className="text-white text-2xl" />
            </div>
            <div className="text-center">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
                              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
                                <span className="text-foreground">Bienvenido a</span> GoStore
                              </h1>
              </h1>
              <p className="text-default-500">Sistema de gestión de ventas</p>
            </div>
          </div>
        </div>

        <div className="flex justify-center">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl w-full px-4">
            {cards.map((card) => {
              const IconComponent = card.icon;

              return (
                <div
                  key={card.href}
                  className="bg-content1 border border-default-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="mb-4 flex items-center gap-3">
                    <IconComponent className="text-2xl text-primary" />
                    <h3 className="text-lg font-semibold text-foreground">
                      {card.title}
                    </h3>
                  </div>
                  <div className="mb-6">
                    <p className="text-sm text-default-500">
                      {card.description}
                    </p>
                  </div>
                  <div>
                    <Button
                      as={Link}
                      className="w-full"
                      color={card.color}
                      href={card.href}
                      variant="flat"
                    >
                      Ir a {card.title}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </DefaultLayout>
  );
}


