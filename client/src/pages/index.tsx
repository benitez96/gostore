import { Button } from "@heroui/button";
import { Link } from "@heroui/link";
import { title, subtitle } from "@/components/primitives";
import DefaultLayout from "@/layouts/default";
import { RiDonutChartLine, RiUserLine, RiShoppingBagLine } from "react-icons/ri";

export default function IndexPage() {
  const cards = [
    {
      title: "Clientes",
      description: "Gestiona tu base de datos de clientes, contactos y información",
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
      description: "Vista general de tu negocio con estadísticas y métricas importantes",
      href: "/dashboard",
      color: "primary" as const,
      icon: RiDonutChartLine,
    },
  ];

  return (
    <DefaultLayout>
      <section className="flex flex-col items-center justify-center gap-8 py-8 md:py-10">
        <div className="inline-block max-w-lg text-center justify-center">
          <h1 className={title()}>Bienvenido a&nbsp;</h1>
          <h1 className={title({ color: "violet" })}>GoStore</h1>
          <div className={subtitle({ class: "mt-4" })}>
            Sistema de gestión de ventas
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl w-full px-4">
          {cards.map((card) => {
            const IconComponent = card.icon;
            return (
              <div key={card.href} className="bg-content1 border border-default-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="mb-4 flex items-center gap-3">
                  <IconComponent className="text-2xl text-primary" />
                  <h3 className="text-lg font-semibold text-foreground">{card.title}</h3>
                </div>
                <div className="mb-6">
                  <p className="text-sm text-default-500">{card.description}</p>
                </div>
                <div>
                  <Button
                    as={Link}
                    href={card.href}
                    color={card.color}
                    variant="flat"
                    className="w-full"
                  >
                    Ir a {card.title}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </DefaultLayout>
  );
}
