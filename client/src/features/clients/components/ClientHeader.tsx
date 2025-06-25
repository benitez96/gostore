
import { Button } from "@heroui/button";

import { Divider } from "@heroui/divider";
import { Link } from "react-router-dom";
import {
  LiaUserSolid,
  LiaPhoneSolid,
  LiaEnvelopeSolid,
  LiaMapMarkerAltSolid,
  LiaArrowLeftSolid,
  LiaUserEditSolid,
} from "react-icons/lia";
import { RiDeleteBinLine, RiShoppingBagLine } from "react-icons/ri";

import { StatusChip } from "@/shared/components/ui";
import { ClientDetail } from "@/api";

export interface ClientHeaderProps {
  client: ClientDetail;
  onEdit: () => void;
  onDelete: () => void;
  onCreateSale: () => void;
}

export function ClientHeader({ client, onEdit, onDelete, onCreateSale }: ClientHeaderProps) {
  return (
    <div className="flex flex-col gap-4">
      {/* Navigation */}
      <div className="flex items-center gap-4">
        <Button
          as={Link}
          to="/clientes"
          variant="light"
          startContent={<LiaArrowLeftSolid />}
        >
          Volver a Clientes
        </Button>
      </div>

      {/* Client Info Card */}
      <div className="bg-white rounded-lg border p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-3">
            <LiaUserSolid className="text-3xl text-primary" />
            <div>
              <h1 className="text-2xl font-bold">
                {client.name} {client.lastname}
              </h1>
              <p className="text-default-600">DNI: {client.dni}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <StatusChip status={client.state?.id || 1} type="client" />
          </div>
        </div>

        <Divider className="my-4" />

        {/* Contact Information */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="flex items-center gap-2">
            <LiaEnvelopeSolid className="text-lg text-default-400" />
            <div>
              <p className="text-sm text-default-600">Email</p>
              <p className="font-medium">{client.email || "No especificado"}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <LiaPhoneSolid className="text-lg text-default-400" />
            <div>
              <p className="text-sm text-default-600">Teléfono</p>
              <p className="font-medium">{client.phone || "No especificado"}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <LiaMapMarkerAltSolid className="text-lg text-default-400" />
            <div>
              <p className="text-sm text-default-600">Dirección</p>
              <p className="font-medium">{client.address || "No especificada"}</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-4">
          <Button
            color="primary"
            startContent={<RiShoppingBagLine />}
            onPress={onCreateSale}
          >
            Nueva Venta
          </Button>
          <Button
            variant="flat"
            startContent={<LiaUserEditSolid />}
            onPress={onEdit}
          >
            Editar Cliente
          </Button>
          <Button
            color="danger"
            variant="flat"
            startContent={<RiDeleteBinLine />}
            onPress={onDelete}
          >
            Eliminar Cliente
          </Button>
        </div>
      </div>
    </div>
  );
} 