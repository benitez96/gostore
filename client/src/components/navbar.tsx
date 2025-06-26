import { Link } from "@heroui/link";
import { Button } from "@heroui/button";
import { Avatar } from "@heroui/avatar";
import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from "@heroui/dropdown";
import {
  Navbar as HeroUINavbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  NavbarMenuToggle,
  NavbarMenu,
  NavbarMenuItem,
} from "@heroui/navbar";
import { 
  RiDashboardLine, 
  RiTeamLine, 
  RiBox3Line, 
  RiShoppingCart2Line, 
  RiUserLine,
  RiLogoutBoxLine,
  RiHomeLine 
} from 'react-icons/ri';

import { siteConfig } from "@/config/site";
import { ThemeSwitch } from "@/components/theme-switch";
import { Logo } from "@/components/icons";
import { useAuthContext } from "./AuthProvider";
import { usePermissionRoute } from "@/shared/hooks/usePermissionRoute";
import { useNavigate } from "react-router-dom";

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  checkPermission: () => boolean;
}

export const Navbar = () => {
  const auth = useAuthContext();
  const permissions = usePermissionRoute();
  const navigate = useNavigate();

  // Configurar elementos de navegación basados en permisos
  const navItems: NavItem[] = [
    {
      label: "Dashboard",
      href: "/dashboard",
      icon: <RiDashboardLine />,
      checkPermission: permissions.canAccessDashboardRoute,
    },
    {
      label: "Clientes",
      href: "/clientes",
      icon: <RiTeamLine />,
      checkPermission: permissions.canAccessClientsRoute,
    },
    {
      label: "Productos",
      href: "/productos",
      icon: <RiBox3Line />,
      checkPermission: permissions.canAccessProductsRoute,
    },
    {
      label: "Usuarios",
      href: "/usuarios",
      icon: <RiUserLine />,
      checkPermission: permissions.canAccessUsersRoute,
    },
  ];

  // Filtrar elementos basados en permisos
  const allowedNavItems = navItems.filter(item => item.checkPermission());

  const handleLogout = () => {
    auth.logout();
    navigate('/login', { replace: true });
  };

  const handleHome = () => {
    navigate('/');
  };

  if (!auth.isAuthenticated) {
    // Navbar simplificado para usuarios no autenticados
    return (
      <HeroUINavbar maxWidth="xl" position="sticky">
        <NavbarContent className="basis-1/5 sm:basis-full" justify="start">
          <NavbarBrand className="gap-3 max-w-fit">
            <Link
              className="flex justify-start items-center gap-1"
              color="foreground"
              href="/"
            >
              <Logo />
              <p className="font-bold text-inherit">{siteConfig.name}</p>
            </Link>
          </NavbarBrand>
        </NavbarContent>

        <NavbarContent justify="end">
          <NavbarItem>
            <ThemeSwitch />
          </NavbarItem>
          <NavbarItem>
            <Button
              as={Link}
              color="primary"
              href="/login"
              variant="solid"
            >
              Iniciar Sesión
            </Button>
          </NavbarItem>
        </NavbarContent>
      </HeroUINavbar>
    );
  }

  return (
    <HeroUINavbar maxWidth="xl" position="sticky">
      <NavbarContent className="basis-1/5 sm:basis-full" justify="start">
        <NavbarBrand className="gap-3 max-w-fit">
          <Button
            className="flex justify-start items-center gap-1 p-0 bg-transparent"
            onPress={handleHome}
          >
            <Logo />
            <p className="font-bold text-inherit">{siteConfig.name}</p>
          </Button>
        </NavbarBrand>
      </NavbarContent>

      {/* Desktop Navigation */}
      <NavbarContent className="hidden sm:flex gap-4" justify="center">
        {allowedNavItems.map((item) => (
          <NavbarItem key={item.href}>
            <Link
              className="flex items-center gap-2"
              color="foreground"
              href={item.href}
            >
              {item.icon}
              {item.label}
            </Link>
          </NavbarItem>
        ))}
      </NavbarContent>

      <NavbarContent justify="end">
        <NavbarItem className="hidden sm:flex">
          <ThemeSwitch />
        </NavbarItem>
        
        {/* User Menu */}
        <NavbarItem>
          <Dropdown>
            <DropdownTrigger>
              <Button
                variant="ghost"
                className="flex items-center gap-2 p-2"
              >
                <Avatar
                  size="sm"
                  name={auth.user?.firstName + ' ' + auth.user?.lastName}
                  className="w-8 h-8"
                />
                <div className="hidden sm:flex flex-col items-start">
                  <span className="text-sm font-medium">
                    {auth.user?.firstName} {auth.user?.lastName}
                  </span>
                  <span className="text-xs text-default-500">
                    {permissions.userRole}
                  </span>
                </div>
              </Button>
            </DropdownTrigger>
            
            <DropdownMenu>
              <DropdownItem
                key="home"
                startContent={<RiHomeLine />}
                onPress={handleHome}
              >
                Inicio
              </DropdownItem>
              <DropdownItem
                key="logout"
                color="danger"
                startContent={<RiLogoutBoxLine />}
                onPress={handleLogout}
              >
                Cerrar Sesión
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </NavbarItem>

        {/* Mobile Menu Toggle */}
        <NavbarMenuToggle className="sm:hidden" />
      </NavbarContent>

      {/* Mobile Menu */}
      <NavbarMenu>
        <div className="mx-4 mt-2 flex flex-col gap-2">
          <div className="flex items-center gap-2 p-2 mb-4">
            <Avatar
              size="sm"
              name={auth.user?.firstName + ' ' + auth.user?.lastName}
            />
            <div>
              <p className="font-medium">
                {auth.user?.firstName} {auth.user?.lastName}
              </p>
              <p className="text-sm text-default-500">
                {permissions.userRole}
              </p>
            </div>
          </div>

          <NavbarMenuItem>
            <Link 
              className="flex items-center gap-2"
              color="foreground" 
              href="/" 
              size="lg"
            >
              <RiHomeLine />
              Inicio
            </Link>
          </NavbarMenuItem>

          {allowedNavItems.map((item) => (
            <NavbarMenuItem key={item.href}>
              <Link
                className="flex items-center gap-2"
                color="foreground"
                href={item.href}
                size="lg"
              >
                {item.icon}
                {item.label}
              </Link>
            </NavbarMenuItem>
          ))}

          <NavbarMenuItem>
            <div className="flex justify-between items-center">
              <ThemeSwitch />
            </div>
          </NavbarMenuItem>

          <NavbarMenuItem>
            <Button
              color="danger"
              variant="flat"
              startContent={<RiLogoutBoxLine />}
              onPress={handleLogout}
              className="w-full justify-start"
            >
              Cerrar Sesión
            </Button>
          </NavbarMenuItem>
        </div>
      </NavbarMenu>
    </HeroUINavbar>
  );
};
