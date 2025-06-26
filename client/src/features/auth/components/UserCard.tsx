import { Card, CardBody, CardHeader } from "@heroui/card";
import { Chip } from "@heroui/chip";
import { Button } from "@heroui/button";
import { 
  RiUserLine, 
  RiSettings3Line,
  RiCheckLine,
  RiCloseLine,
  RiLockUnlockLine,
  RiUserForbidLine
} from "react-icons/ri";
import { User } from "@/api";
import { PERMISSIONS, getUserRole } from "@/shared/hooks/useAuth";

interface UserCardProps {
  user: User;
  onEdit: (user: User) => void;
  onToggleActive: (user: User) => void;
  onResetPassword: (user: User) => void;
}

export default function UserCard({ user, onEdit, onToggleActive, onResetPassword }: UserCardProps) {
  const getPermissionChips = (permissions: number) => {
    const chips = [];
    
    if (permissions & PERMISSIONS.CLIENTES) {
      chips.push(
        <Chip key="clientes" size="sm" color="secondary" variant="flat">
          Clientes
        </Chip>
      );
    }
    
    if (permissions & PERMISSIONS.PRODUCTOS) {
      chips.push(
        <Chip key="productos" size="sm" color="success" variant="flat">
          Productos
        </Chip>
      );
    }

    if (permissions & PERMISSIONS.VENTAS) {
      chips.push(
        <Chip key="ventas" size="sm" color="warning" variant="flat">
          Ventas
        </Chip>
      );
    }
    
    if (permissions & PERMISSIONS.DASHBOARD) {
      chips.push(
        <Chip key="dashboard" size="sm" color="primary" variant="flat">
          Dashboard
        </Chip>
      );
    }

    if (permissions & PERMISSIONS.USUARIOS) {
      chips.push(
        <Chip key="usuarios" size="sm" color="danger" variant="flat">
          Usuarios
        </Chip>
      );
    }
    
    return chips;
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-default-100 rounded-lg">
              <RiUserLine className="text-default-600" />
            </div>
            <div>
              <h3 className="font-semibold">
                {user.firstName} {user.lastName}
              </h3>
              <p className="text-sm text-default-500">@{user.username}</p>
            </div>
          </div>
          
          {user.is_active ? (
            <RiCheckLine className="text-success text-xl" />
          ) : (
            <RiCloseLine className="text-danger text-xl" />
          )}
        </div>
      </CardHeader>
      
      <CardBody className="pt-0">
        <div className="space-y-3">
          <div>
            <p className="text-xs text-default-500 mb-1">Rol</p>
            <div className="flex items-center gap-2">
              <Chip 
                size="sm" 
                color={user.permissions & PERMISSIONS.USUARIOS ? "primary" : "default"}
                variant="flat"
              >
                {getUserRole(user.permissions)}
              </Chip>
              <Chip 
                size="sm" 
                color={user.is_active ? "success" : "danger"}
                variant="flat"
              >
                {user.is_active ? "Activo" : "Inactivo"}
              </Chip>
            </div>
          </div>
          
          <div>
            <p className="text-xs text-default-500 mb-2">Permisos</p>
            <div className="flex flex-wrap gap-1">
              {getPermissionChips(user.permissions)}
            </div>
          </div>
          
          <div>
            <p className="text-xs text-default-500 mb-1">Bitmask</p>
            <span className="text-xs font-mono bg-default-100 px-2 py-1 rounded">
              {user.permissions.toString(2).padStart(5, '0')} ({user.permissions})
            </span>
          </div>
        </div>
        
        <div className="mt-4 pt-3 border-t border-default-200 flex gap-2">
          <Button
            size="sm"
            variant="light"
            startContent={<RiSettings3Line />}
            onPress={() => onEdit(user)}
            className="flex-1"
          >
            Editar
          </Button>
          <Button
            size="sm"
            variant="light"
            color="warning"
            startContent={<RiLockUnlockLine />}
            onPress={() => onResetPassword(user)}
          >
            Blanquear
          </Button>
          <Button
            size="sm"
            variant="light"
            color={user.is_active ? "danger" : "success"}
            startContent={user.is_active ? <RiUserForbidLine /> : <RiCheckLine />}
            onPress={() => onToggleActive(user)}
          >
            {user.is_active ? "Bloquear" : "Activar"}
          </Button>
        </div>
      </CardBody>
    </Card>
  );
} 