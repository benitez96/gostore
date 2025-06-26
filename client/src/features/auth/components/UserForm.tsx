import { useState, useEffect } from "react";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Card, CardBody } from "@heroui/card";
import { Checkbox, CheckboxGroup } from "@heroui/checkbox";
import { Form } from "@heroui/form";
import { Chip } from "@heroui/chip";
import { RiUserAddLine, RiUserLine, RiLockLine, RiEyeLine, RiEyeOffLine, RiSaveLine } from "react-icons/ri";

import { PERMISSIONS, getUserRole } from "@/shared/hooks/useAuth";
import { CreateUserRequest, UpdateUserRequest, User } from "@/api";

interface FormData {
  username: string;
  password: string;
  firstName: string;
  lastName: string;
  permissions: number;
}

interface UserFormProps {
  user?: User | null; // For edit mode
  onSubmit: (data: CreateUserRequest | UpdateUserRequest) => Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
  mode?: 'create' | 'edit';
}

export default function UserForm({
  user,
  onSubmit,
  onCancel,
  isLoading = false,
  mode = 'create'
}: UserFormProps) {
  const [formData, setFormData] = useState<FormData>({
    username: "",
    password: "",
    firstName: "",
    lastName: "",
    permissions: 0,
  });
  
  const [showPassword, setShowPassword] = useState(false);

  // Initialize form with user data in edit mode
  useEffect(() => {
    if (mode === 'edit' && user) {
      setFormData({
        username: user.username,
        password: "", // Don't populate password in edit mode
        firstName: user.firstName,
        lastName: user.lastName,
        permissions: user.permissions,
      });
    }
  }, [user, mode]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (mode === 'create') {
      const createData: CreateUserRequest = {
        username: formData.username,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        permissions: formData.permissions,
      };
      onSubmit(createData);
    } else {
      const updateData: UpdateUserRequest = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        permissions: formData.permissions,
      };
      onSubmit(updateData);
    }
  };

  // Convert permissions bitmask to checkbox values
  const getSelectedPermissions = (): string[] => {
    const selected: string[] = [];
    if (formData.permissions & PERMISSIONS.CLIENTES) selected.push('clientes');
    if (formData.permissions & PERMISSIONS.PRODUCTOS) selected.push('productos');
    if (formData.permissions & PERMISSIONS.DASHBOARD) selected.push('dashboard');
    if (formData.permissions & PERMISSIONS.VENTAS) selected.push('ventas');
    if (formData.permissions & PERMISSIONS.USUARIOS) selected.push('usuarios');
    return selected;
  };

  // Convert checkbox selection to bitmask
  const handlePermissionChange = (selectedValues: string[]) => {
    let newPermissions = 0;
    if (selectedValues.includes('clientes')) newPermissions |= PERMISSIONS.CLIENTES;
    if (selectedValues.includes('productos')) newPermissions |= PERMISSIONS.PRODUCTOS;
    if (selectedValues.includes('dashboard')) newPermissions |= PERMISSIONS.DASHBOARD;
    if (selectedValues.includes('ventas')) newPermissions |= PERMISSIONS.VENTAS;
    if (selectedValues.includes('usuarios')) newPermissions |= PERMISSIONS.USUARIOS;
    
    setFormData(prev => ({ ...prev, permissions: newPermissions }));
  };

  const isFormValid = mode === 'create' 
    ? formData.username.trim().length >= 3 &&
      formData.password.trim().length >= 6 &&
      formData.firstName.trim().length >= 2 &&
      formData.lastName.trim().length >= 2 &&
      formData.permissions > 0
    : formData.firstName.trim().length >= 2 &&
      formData.lastName.trim().length >= 2 &&
      formData.permissions > 0;
      
  const title = mode === 'create' ? 'Crear Usuario' : 'Editar Usuario';
  const submitText = mode === 'create' ? 'Crear Usuario' : 'Guardar Cambios';

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-lg">      
      <CardBody className="px-6 pb-6 pt-4">
        <Form onSubmit={handleSubmit} className="space-y-6">
          {/* Información personal */}
          <div className="space-y-4 w-full">
            <h3 className="text-lg font-medium text-default-700">Información Personal</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Nombre"
                placeholder="Ingresa el nombre"
                value={formData.firstName}
                onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                startContent={<RiUserLine className="text-default-400" />}
                variant="bordered"
                isRequired
              />
              
              <Input
                label="Apellido"
                placeholder="Ingresa el apellido"
                value={formData.lastName}
                onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                startContent={<RiUserLine className="text-default-400" />}
                variant="bordered"
                isRequired
              />
            </div>
          </div>

          {/* Credenciales */}
          {mode === 'create' && (
            <div className="space-y-4 w-full">
              <h3 className="text-lg font-medium text-default-700">Credenciales</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Usuario"
                  placeholder="usuario123"
                  value={formData.username}
                  onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                  startContent={<RiUserLine className="text-default-400" />}
                  variant="bordered"
                  isRequired
                />
                
                <Input
                  type={showPassword ? "text" : "password"}
                  label="Contraseña"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  startContent={<RiLockLine className="text-default-400" />}
                  endContent={
                    <Button
                      isIconOnly
                      variant="light"
                      size="sm"
                      type="button"
                      radius="full"
                      onPress={() => setShowPassword(!showPassword)}
                      aria-label="toggle password visibility"
                    >
                      {showPassword ? (
                        <RiEyeOffLine className="text-xl text-default-400" />
                      ) : (
                        <RiEyeLine className="text-xl text-default-400" />
                      )}
                    </Button>
                  }
                  variant="bordered"
                  isRequired
                />
              </div>
            </div>
          )}

          {/* Permisos */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-default-700">Permisos de Acceso</h3>
            
            <CheckboxGroup
              value={getSelectedPermissions()}
              onValueChange={handlePermissionChange}
              orientation="vertical"
              color="primary"
              classNames={{
                wrapper: "gap-4"
              }}
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Checkbox value="clientes">
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">Clientes</span>
                    <span className="text-xs text-default-500">Gestionar base de clientes</span>
                  </div>
                </Checkbox>
                
                <Checkbox value="productos">
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">Productos</span>
                    <span className="text-xs text-default-500">Administrar inventario</span>
                  </div>
                </Checkbox>
                
                <Checkbox value="ventas">
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">Ventas</span>
                    <span className="text-xs text-default-500">Gestionar ventas y pagos</span>
                  </div>
                </Checkbox>
                
                <Checkbox value="dashboard">
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">Dashboard</span>
                    <span className="text-xs text-default-500">Ver reportes y analytics</span>
                  </div>
                </Checkbox>
              </div>
              
              {/* Permisos administrativos */}
              <div className="border-t pt-4 mt-4">
                <h4 className="text-sm font-medium text-default-600 mb-3">Permisos Administrativos</h4>
                <Checkbox value="usuarios">
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-warning-600">Gestión de Usuarios</span>
                    <span className="text-xs text-default-500">Crear, editar y eliminar usuarios del sistema</span>
                  </div>
                </Checkbox>
              </div>
            </CheckboxGroup>
            
            {/* Vista previa del rol */}
            {formData.permissions > 0 && (
              <div className="mt-4 p-3 bg-default-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm text-default-600">Rol asignado:</span>
                  <Chip color="primary" size="sm" variant="flat">
                    {getUserRole(formData.permissions)}
                  </Chip>
                </div>
                <div className="text-xs text-default-500">
                  Permisos binarios: {formData.permissions.toString(2).padStart(5, '0')} (decimal: {formData.permissions})
                </div>
              </div>
            )}
          </div>

          {/* Botones */}
          <div className="flex gap-3">
            {onCancel && (
              <Button
                type="button"
                variant="bordered"
                onPress={onCancel}
                className="flex-1"
              >
                Cancelar
              </Button>
            )}
            <Button
              type="submit"
              className={`font-semibold ${onCancel ? 'flex-1' : 'w-full'}`}
              color="primary"
              size="lg"
              isLoading={isLoading}
              isDisabled={!isFormValid || isLoading}
              startContent={!isLoading && (mode === 'create' ? <RiUserAddLine /> : <RiSaveLine />)}
            >
              {isLoading ? 
                (mode === 'create' ? "Creando usuario..." : "Guardando cambios...") : 
                submitText
              }
            </Button>
          </div>
        </Form>
      </CardBody>
    </Card>
  );
} 