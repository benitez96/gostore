import { Button } from "@heroui/button";
import { Chip } from "@heroui/chip";
import { Divider } from "@heroui/divider";
import { Link } from "react-router-dom";
import { Tooltip } from "@heroui/tooltip";
import {
  LiaUserSolid,
  LiaPhoneSolid,
  LiaEnvelopeSolid,
  LiaMapMarkerAltSolid,
  LiaArrowLeftSolid,
} from "react-icons/lia";
import { RiEditLine, RiDeleteBinLine } from "react-icons/ri";

import { ClientDetail } from "@/api";

const statusColorMap = {
  1: "success",
  2: "warning", 
  3: "danger",
} as const;

const statusTextMap = {
  1: "Al día",
  2: "Advertencia",
  3: "Deudor",
} as const;

export interface ClientHeaderProps {
  client: ClientDetail;
  onEdit: () => void;
  onDelete: () => void;
}

export function ClientHeader({ client, onEdit, onDelete }: ClientHeaderProps) {
  return (
    <section className="flex flex-col gap-6">
      {/* Header con título y navegación */}
      <div className="flex items-center justify-between max-w-7xl w-full px-4">
        <div className="flex items-center gap-3">
          <Button 
            as={Link} 
            size="sm" 
            to="/clientes" 
            variant="flat"
            color="primary"
            startContent={<LiaArrowLeftSolid />}
            className="font-medium transition-all duration-200 hover:scale-105"
          >
            Volver a clientes
          </Button>
          <Divider orientation="vertical" />
          <div className="p-3 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl">
            <LiaUserSolid className="text-white text-2xl" />
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
              Detalle del Cliente
            </h1>
            <p className="text-default-500">
              Información completa y gestión del cliente
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl w-full px-4">
        {/* Información del cliente */}
        <div className="bg-content1 border border-default-200 rounded-lg p-4 mb-4">
          <div className="flex gap-3 mb-4">
            <LiaUserSolid className="text-2xl text-primary" />
            <div className="flex flex-col flex-1">
              <p className="text-md font-semibold">
                {client.name} {client.lastname}
              </p>
              <p className="text-small text-default-500">
                Cliente #{client.id}
              </p>
            </div>
            <div className="flex gap-2 items-center -mt-4">
              <div className="flex gap-2 items-center">
                <Tooltip content="Editar cliente">
                  <Button
                    isIconOnly
                    size="sm"
                    variant="flat"
                    onPress={onEdit}
                  >
                    <RiEditLine />
                  </Button>
                </Tooltip>
                <Tooltip content="Eliminar cliente">
                  <Button
                    isIconOnly
                    color="danger"
                    size="sm"
                    variant="flat"
                    onPress={onDelete}
                  >
                    <RiDeleteBinLine />
                  </Button>
                </Tooltip>
              </div>
              <Chip
                className="capitalize"
                color={
                  statusColorMap[
                    client.state?.id as keyof typeof statusColorMap
                  ] || "default"
                }
                size="sm"
                variant="flat"
              >
                {statusTextMap[
                  client.state?.id as keyof typeof statusTextMap
                ] || "Desconocido"}
              </Chip>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Primera columna - 3 datos */}
            <div className="flex items-center gap-3">
              <LiaUserSolid className="text-lg text-default-500" />
              <div>
                <p className="text-sm text-default-500">DNI</p>
                <p className="font-medium">{client.dni}</p>
              </div>
            </div>

            {client.email && (
              <div className="flex items-center gap-3">
                <LiaEnvelopeSolid className="text-lg text-default-500" />
                <div>
                  <p className="text-sm text-default-500">Email</p>
                  <p className="font-medium">{client.email}</p>
                </div>
              </div>
            )}

            {client.phone && (
              <div className="flex items-center gap-3">
                <LiaPhoneSolid className="text-lg text-default-500" />
                <div>
                  <p className="text-sm text-default-500">Teléfono</p>
                  <p className="font-medium">{client.phone}</p>
                </div>
              </div>
            )}

            {/* Cuarta columna - 1 dato */}
            {client.address && (
              <div className="flex items-center gap-3">
                <LiaMapMarkerAltSolid className="text-lg text-default-500" />
                <div>
                  <p className="text-sm text-default-500">Dirección</p>
                  <p className="font-medium">{client.address}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
} 