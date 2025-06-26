import { Button } from "@heroui/button";
import { Link } from "@heroui/link";
import {
  RiDonutChartLine,
  RiUserLine,
  RiShoppingBagLine,
  RiHomeLine,
  RiLoginBoxLine,
  RiTeamLine,
} from "react-icons/ri";

import DefaultLayout from "@/layouts/default";
import { useAuthContext } from "@/components/AuthProvider";
import { usePermissionRoute } from "@/shared/hooks/usePermissionRoute";

export default function IndexPage() {
  const { isAuthenticated, isLoading, user } = useAuthContext();
  const permissions = usePermissionRoute();

  console.log('🏠 IndexPage render:', {
    isAuthenticated,
    isLoading,
    hasUser: !!user,
    userPermissions: user?.permissions,
    permissionsState: {
      canAccessDashboard: permissions.canAccessDashboardRoute(),
      canAccessClients: permissions.canAccessClientsRoute(),
      canAccessProducts: permissions.canAccessProductsRoute(),
    }
  });

  // Mostrar loading mientras verifica autenticación
  if (isLoading) {
    console.log('⏳ IndexPage: Mostrando loading...');
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const cards = [
    {
      title: "Dashboard",
      description:
        "Vista general de tu negocio con estadísticas y métricas importantes",
      href: "/dashboard",
      color: "primary" as const,
      icon: RiDonutChartLine,
      canAccess: permissions.canAccessDashboardRoute,
    },
    {
      title: "Clientes",
      description:
        "Gestiona tu base de datos de clientes, contactos y información",
      href: "/clientes",
      color: "secondary" as const,
      icon: RiUserLine,
      canAccess: permissions.canAccessClientsRoute,
    },
    {
      title: "Productos",
      description: "Administra tu catálogo de productos, precios y inventario",
      href: "/productos",
      color: "success" as const,
      icon: RiShoppingBagLine,
      canAccess: permissions.canAccessProductsRoute,
    },
    {
      title: "Usuarios",
      description: "Administra los usuarios del sistema, permisos y roles",
      href: "/usuarios",
      color: "warning" as const,
      icon: RiTeamLine,
      canAccess: permissions.canAccessUsersRoute,
    },
  ];

  // Filtrar tarjetas basadas en permisos - solo mostrar las que el usuario puede acceder
  const availableCards = isAuthenticated 
    ? cards.filter(card => card.canAccess()) 
    : [];

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
                {isAuthenticated ? (
                  <>¡Hola, {user?.firstName}! <span className="text-foreground">Bienvenido a</span> GoStore</>
                ) : (
                  <><span className="text-foreground">Bienvenido a</span> GoStore</>
                )}
              </h1>
              <p className="text-default-500">
                {isAuthenticated 
                  ? `${permissions.userRole} - Elige una sección para continuar`
                  : "Sistema de gestión de ventas"
                }
              </p>
            </div>
          </div>
        </div>

        {/* Contenido principal */}
        {!isAuthenticated ? (
          /* Usuario no autenticado - Mostrar botón de login y descripción del sistema */
          <div className="flex flex-col items-center gap-6 max-w-2xl mx-auto px-4">
            <div className="text-center">
              <p className="text-lg text-default-600 mb-4">
                Sistema completo de gestión de ventas con control de inventario, 
                clientes, productos y reportes financieros.
              </p>
              <p className="text-default-500 mb-6">
                Inicia sesión para acceder a todas las funcionalidades del sistema.
              </p>
            </div>
            
            <Button
              as={Link}
              href="/login"
              color="primary"
              size="lg"
              startContent={<RiLoginBoxLine />}
              className="px-8"
            >
              Iniciar Sesión
            </Button>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full mt-8">
              <div className="bg-content1 border border-default-200 rounded-lg p-4 text-center">
                <RiDonutChartLine className="text-2xl text-primary mx-auto mb-2" />
                <h4 className="font-medium text-foreground mb-1">Dashboard</h4>
                <p className="text-sm text-default-500">Métricas y estadísticas</p>
              </div>
              <div className="bg-content1 border border-default-200 rounded-lg p-4 text-center">
                <RiUserLine className="text-2xl text-secondary mx-auto mb-2" />
                <h4 className="font-medium text-foreground mb-1">Clientes</h4>
                <p className="text-sm text-default-500">Gestión de clientes</p>
              </div>
              <div className="bg-content1 border border-default-200 rounded-lg p-4 text-center">
                <RiShoppingBagLine className="text-2xl text-success mx-auto mb-2" />
                <h4 className="font-medium text-foreground mb-1">Productos</h4>
                <p className="text-sm text-default-500">Inventario y catálogo</p>
              </div>
              <div className="bg-content1 border border-default-200 rounded-lg p-4 text-center">
                <RiTeamLine className="text-2xl text-warning mx-auto mb-2" />
                <h4 className="font-medium text-foreground mb-1">Usuarios</h4>
                <p className="text-sm text-default-500">Administración</p>
              </div>
            </div>
          </div>
        ) : availableCards.length > 0 ? (
          /* Usuario autenticado con permisos - Mostrar tarjetas funcionales */
          <div className="flex justify-center">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl w-full px-4">
              {availableCards.map((card) => {
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
        ) : (
          /* Usuario autenticado sin permisos */
          <div className="text-center max-w-md mx-auto px-4">
            <div className="bg-content1 border border-default-200 rounded-lg p-8">
              <RiUserLine className="text-4xl text-default-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Sin permisos asignados
              </h3>
              <p className="text-default-500 mb-4">
                Tu cuenta no tiene permisos para acceder a ninguna sección del sistema.
              </p>
              <p className="text-sm text-default-400">
                Contacta con tu administrador para obtener los permisos necesarios.
              </p>
            </div>
          </div>
        )}
      </section>
    </DefaultLayout>
  );
}


