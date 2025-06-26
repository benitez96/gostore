import { useState } from "react";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from "@heroui/modal";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { RiLockUnlockLine, RiEyeLine, RiEyeOffLine } from "react-icons/ri";
import { User } from "@/api";
import { getUserRole } from "@/shared/hooks/useAuth";

interface ResetPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (newPassword: string) => Promise<void>;
  user: User | null;
  isLoading?: boolean;
}

export default function ResetPasswordModal({
  isOpen,
  onClose,
  onConfirm,
  user,
  isLoading = false,
}: ResetPasswordModalProps) {
  const [newPassword, setNewPassword] = useState("123456");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);

  const handleConfirm = async () => {
    if (!newPassword.trim()) return;
    
    setIsConfirming(true);
    try {
      await onConfirm(newPassword);
      handleClose();
    } finally {
      setIsConfirming(false);
    }
  };

  const handleClose = () => {
    setNewPassword("123456");
    setIsPasswordVisible(false);
    setIsConfirming(false);
    onClose();
  };

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  if (!user) return null;

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="md">
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <RiLockUnlockLine className="text-2xl text-warning" />
            <span>Blanquear Contraseña</span>
          </div>
        </ModalHeader>
        
        <ModalBody>
          <div className="space-y-4">
            {/* User Info */}
            <div className="p-4 bg-default-50 rounded-lg">
              <h4 className="font-medium mb-2">Usuario</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-default-500">Usuario:</p>
                  <p className="font-medium">{user.username}</p>
                </div>
                <div>
                  <p className="text-default-500">Nombre:</p>
                  <p className="font-medium">{user.firstName} {user.lastName}</p>
                </div>
                <div>
                  <p className="text-default-500">Rol:</p>
                  <p className="font-medium">{getUserRole(user.permissions)}</p>
                </div>
              </div>
            </div>

            {/* Warning */}
            <div className="p-4 bg-warning-50 rounded-lg">
              <h4 className="font-medium mb-2 text-warning">
                Atención
              </h4>
              <div className="space-y-2 text-sm">
                <p>• La contraseña actual será reemplazada</p>
                <p>• El usuario deberá usar la nueva contraseña para ingresar</p>
                <p>• Se recomienda cambiar la contraseña después del próximo login</p>
              </div>
            </div>

            {/* New Password Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Nueva Contraseña</label>
              <Input
                type={isPasswordVisible ? "text" : "password"}
                placeholder="Ingresa la nueva contraseña"
                value={newPassword}
                onValueChange={setNewPassword}
                endContent={
                  <button
                    className="focus:outline-none"
                    type="button"
                    onClick={togglePasswordVisibility}
                  >
                    {isPasswordVisible ? (
                      <RiEyeOffLine className="text-2xl text-default-400 pointer-events-none" />
                    ) : (
                      <RiEyeLine className="text-2xl text-default-400 pointer-events-none" />
                    )}
                  </button>
                }
                minLength={6}
                isRequired
              />
              {newPassword.length < 6 && newPassword.length > 0 && (
                <p className="text-danger text-xs">
                  La contraseña debe tener al menos 6 caracteres
                </p>
              )}
            </div>
          </div>
        </ModalBody>
        
        <ModalFooter>
          <Button variant="light" onPress={handleClose}>
            Cancelar
          </Button>
          <Button
            color="warning"
            onPress={handleConfirm}
            isLoading={isConfirming || isLoading}
            isDisabled={newPassword.length < 6}
          >
            Blanquear Contraseña
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
} 