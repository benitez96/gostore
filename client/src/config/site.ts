export type SiteConfig = typeof siteConfig;

export const siteConfig = {
  name: import.meta.env.VITE_APP_NAME || "GoStore",
  description: "Sistema de gestión de ventas.",
  navItems: [
    {
      label: "Clientes",
      href: "/clientes",
    },
    {
      label: "Productos",
      href: "/productos",
    },
    {
      label: "Dashboard",
      href: "/dashboard",
    },
    {
      label: "Usuarios",
      href: "/usuarios",
    },
  ],
  navMenuItems: [
    {
      label: "Dashboard",
      href: "/dashboard",
    },
    {
      label: "Clientes",
      href: "/clientes",
    },
    {
      label: "Productos",
      href: "/productos",
    },
    {
      label: "Usuarios",
      href: "/usuarios",
    },
  ],
};
