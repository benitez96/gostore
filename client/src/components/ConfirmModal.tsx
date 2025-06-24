import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@heroui/modal";
import { Button } from "@heroui/button";
import { RiErrorWarningLine } from "react-icons/ri";
import { LiaTrashAltSolid } from "react-icons/lia";

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isLoading?: boolean;
  entityInfo?: { [key: string]: string | number };
  impactList?: string[];
  isDangerous?: boolean;
}

export default function ConfirmModal({
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
  isDangerous = true,
}: ConfirmModalProps) {
  if (!isOpen) return null;

  const useSimpleFormat = !entityInfo && !impactList;

  if (useSimpleFormat) {
    const messageLines = message.split("\n").map((line, index) => (
      <div key={index} className={line.trim() === "" ? "h-2" : ""}>
        {line}
      </div>
    ));

    return (
      <Modal isOpen={isOpen} size="md" onClose={onClose}>
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1">
            <div className="flex items-center gap-3">
              <RiErrorWarningLine className="text-2xl text-warning" />
              <span>{title}</span>
            </div>
          </ModalHeader>
          <ModalBody>
            <div className="text-default-600 whitespace-pre-line">
              {messageLines}
            </div>
          </ModalBody>
          <ModalFooter>
            <Button
              color="default"
              isDisabled={isLoading}
              variant="light"
              onPress={onClose}
            >
              {cancelText}
            </Button>
            <Button color="danger" isLoading={isLoading} onPress={onConfirm}>
              {confirmText}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    );
  }

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
            <div className="p-4 bg-danger-50 rounded-lg">
              <h4 className="font-medium mb-2 text-danger">
                Confirmar Eliminación
              </h4>
              <p className="text-sm text-default-600">
                {message}
              </p>
            </div>

            {entityInfo && (
              <div className="p-4 bg-default-50 rounded-lg">
                <h4 className="font-medium mb-2">Información</h4>
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

            {impactList && impactList.length > 0 && (
              <div className="p-4 bg-warning-50 rounded-lg">
                <h4 className="font-medium mb-2 text-warning">
                  Impacto de la Eliminación
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
          <Button
            variant="light"
            isDisabled={isLoading}
            onPress={onClose}
          >
            {cancelText}
          </Button>
          <Button 
            color={isDangerous ? "danger" : "primary"} 
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
