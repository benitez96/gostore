import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@heroui/modal";
import { Button } from "@heroui/button";
import { RiErrorWarningLine } from "react-icons/ri";

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isLoading?: boolean;
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
}: ConfirmModalProps) {
  if (!isOpen) return null;

  // Split message by lines and render each line
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
