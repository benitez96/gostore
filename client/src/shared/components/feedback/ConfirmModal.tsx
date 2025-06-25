import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@heroui/modal";
import { Button } from "@heroui/button";
import { LiaTrashAltSolid } from "react-icons/lia";

export interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isLoading?: boolean;
  entityInfo?: Record<string, string>;
  impactList?: string[];
  isDangerous?: boolean;
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  isLoading = false,
  entityInfo,
  impactList,
  isDangerous = false,
}: ConfirmModalProps) {
  return (
    <Modal isOpen={isOpen} size="md" onClose={onClose}>
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <LiaTrashAltSolid className="text-2xl text-danger" />
            <span>{title}</span>
          </div>
        </ModalHeader>
        <ModalBody>
          <div className="space-y-4">
            {/* Confirmation message */}
            <div className={`p-4 rounded-lg ${isDangerous ? 'bg-danger-50' : 'bg-warning-50'}`}>
              <h4 className={`font-medium mb-2 ${isDangerous ? 'text-danger' : 'text-warning'}`}>
                Confirmar {isDangerous ? 'Eliminación' : 'Acción'}
              </h4>
              <p className="text-sm text-default-600">
                {message}
              </p>
            </div>

            {/* Entity information */}
            {entityInfo && (
              <div className="p-4 bg-default-50 rounded-lg">
                <h4 className="font-medium mb-2">Información del Elemento</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  {Object.entries(entityInfo).map(([key, value]) => (
                    <div key={key}>
                      <p className="text-default-500">{key}:</p>
                      <p className="font-medium">{value}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Impact information */}
            {impactList && impactList.length > 0 && (
              <div className="p-4 bg-warning-50 rounded-lg">
                <h4 className="font-medium mb-2 text-warning">
                  Impacto de la {isDangerous ? 'Eliminación' : 'Acción'}
                </h4>
                <div className="space-y-2 text-sm">
                  {impactList.map((impact, index) => (
                    <p key={index}>• {impact}</p>
                  ))}
                </div>
              </div>
            )}
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant="light" onPress={onClose}>
            {cancelText}
          </Button>
          <Button
            color={isDangerous ? "danger" : "warning"}
            isLoading={isLoading}
            onPress={onConfirm}
          >
            {confirmText}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
} 