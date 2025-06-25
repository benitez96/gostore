import { Chip } from "@heroui/chip";
import { statusColorMap, statusTextMap, getQuotaStatus, getSaleStatus } from "../../utils/constants";

export interface StatusChipProps {
  status: number;
  type?: "client" | "quota" | "sale";
  data?: any; // For quota and sale status that need additional data
}

export function StatusChip({ status, type = "client", data }: StatusChipProps) {
  if (type === "quota" && data) {
    const quotaStatus = getQuotaStatus(data);
    return (
      <Chip
        color={quotaStatus.color}
        size="sm"
        variant="flat"
      >
        {quotaStatus.text}
      </Chip>
    );
  }

  if (type === "sale" && data) {
    const saleStatus = getSaleStatus(data);
    return (
      <Chip
        color={saleStatus.color}
        size="sm"
        variant="flat"
      >
        {saleStatus.text}
      </Chip>
    );
  }

  // Default client status
  const color = statusColorMap[status as keyof typeof statusColorMap] || "default";
  const text = statusTextMap[status as keyof typeof statusTextMap] || "Desconocido";

  return (
    <Chip
      color={color}
      size="sm"
      variant="flat"
    >
      {text}
    </Chip>
  );
} 