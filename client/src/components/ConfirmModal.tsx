import { Button } from "@heroui/button";
import { RiErrorWarningLine, RiCloseLine } from "react-icons/ri";

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
  const messageLines = message.split('\n').map((line, index) => (
    <div key={index} className={line.trim() === '' ? 'h-2' : ''}>
      {line}
    </div>
  ));

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-content1 rounded-lg p-6 w-full max-w-md mx-4 relative">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-default-400 hover:text-default-600 transition-colors"
          disabled={isLoading}
        >
          <RiCloseLine className="text-xl" />
        </button>

        <div className="flex items-center gap-3 mb-4 pr-8">
          <RiErrorWarningLine className="text-2xl text-warning" />
          <h2 className="text-xl font-semibold text-foreground">
            {title}
          </h2>
        </div>
        
        <div className="text-default-600 mb-6 whitespace-pre-line">
          {messageLines}
        </div>

        <div className="flex justify-end gap-3">
          <Button 
            color="default" 
            variant="light" 
            onPress={onClose}
            isDisabled={isLoading}
          >
            {cancelText}
          </Button>
          <Button 
            color="danger" 
            onPress={onConfirm}
            isLoading={isLoading}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
} 