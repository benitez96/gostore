/**
 * Status mappings
 */
export const statusColorMap = {
  1: "success",
  2: "warning", 
  3: "danger",
} as const;

export const statusTextMap = {
  1: "Al día",
  2: "Advertencia", 
  3: "Deudor",
} as const;

export const statusOptions = [
  { name: "Al día", uid: "1" },
  { name: "Advertencia", uid: "2" },
  { name: "Deudor", uid: "3" },
];

/**
 * Quota status utilities
 */
export const getQuotaStatus = (
  quota: any,
): {
  color: "success" | "primary" | "warning" | "danger" | "default" | "secondary";
  text: string;
} => {
  // Si está pagada, siempre es verde
  if (quota.is_paid) {
    return { color: "success", text: "Pagada" };
  }

  // Mapear estados del backend:
  // 1: Pendiente (azul)
  // 2: Advertencia (naranja)
  // 3: Vencida (roja)
  switch (quota.state) {
    case 1:
      return { color: "primary", text: "Pendiente" };
    case 2:
      return { color: "warning", text: "Advertencia" };
    case 3:
      return { color: "danger", text: "Vencida" };
    default:
      return { color: "default", text: "Desconocido" };
  }
};

/**
 * Sale status utilities
 */
export const getSaleStatus = (
  sale: any,
): {
  color: "success" | "primary" | "warning" | "danger" | "default" | "secondary";
  text: string;
} => {
  // Si está pagada, siempre es verde
  if (sale.is_paid) {
    return { color: "success", text: "Pagada" };
  }

  // Mapear estados del backend:
  // 1: Pendiente (azul)
  // 2: Advertencia (naranja)
  // 3: Vencida (roja)
  switch (sale.state) {
    case 1:
      return { color: "primary", text: "Pendiente" };
    case 2:
      return { color: "warning", text: "Advertencia" };
    case 3:
      return { color: "danger", text: "Vencida" };
    default:
      return { color: "default", text: "Desconocido" };
  }
};

export const getStatusColor = (statusName: string) => {
  switch (statusName.toLowerCase()) {
    case "ok":
      return "success";
    case "warning":
      return "warning";
    case "suspended":
      return "danger";
    default:
      return "default";
  }
};

export const getStatusText = (statusName: string) => {
  switch (statusName.toLowerCase()) {
    case "ok":
      return "Al día";
    case "warning":
      return "Advertencia";
    case "suspended":
      return "Suspendido";
    default:
      return statusName;
  }
}; 