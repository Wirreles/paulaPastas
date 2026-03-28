// lib/navigation.config.ts

export interface NavItem {
  name: string;
  href: string;
  id: string;
  submenu?: SubMenuItem[];
}

export interface SubMenuItem {
  name: string;
  href: string;
  id: string;
  subcategorias?: Array<{ name: string; href: string }>;
}

export const NAVIGATION_DATA: NavItem[] = [
  { name: "Inicio", href: "/", id: "inicio" },
  {
    name: "Pastas",
    href: "/pastas",
    id: "pastas",
    submenu: [
      {
        name: "Rellenas",
        href: "/pastas/rellenas",
        id: "rellenas",
        subcategorias: [
          { name: "Lasagna", href: "/pastas/rellenas/lasagna/lasagna-estrato" },
          { name: "Ravioles", href: "/pastas/rellenas/ravioles" },
          { name: "Sorrentinos", href: "/pastas/rellenas/sorrentinos" },
        ],
      },
      {
        name: "Sin Relleno",
        href: "/pastas/sin-relleno",
        id: "sin-relleno",
        subcategorias: [
          { name: "Ñoquis", href: "/pastas/sin-relleno/noquis/nube-de-papa" },
          { name: "Fideos", href: "/pastas/sin-relleno/fideos" },
        ],
      },
      { name: "Sin TACC", href: "/pastas/sin-tacc", id: "sin-tacc" },
      { name: "Pack Raviolada", href: "/pack-raviolada", id: "pack" },
      { name: "Salsas", href: "/salsas", id: "salsas" },
    ],
  },
  { name: "Nosotros", href: "/nosotros", id: "nosotros" },
  { name: "Delivery", href: "/delivery", id: "delivery" },
  { name: "Blog", href: "/blog", id: "blog" },
];