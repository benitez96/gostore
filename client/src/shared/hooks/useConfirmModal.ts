import { useState } from "react";

export interface ConfirmModalConfig {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void | Promise<void>;
  onCancel?: () => void;
}

export interface UseConfirmModalReturn {
  isOpen: boolean;
  config: ConfirmModalConfig | null;
  openConfirm: (config: ConfirmModalConfig) => void;
  closeConfirm: () => void;
  handleConfirm: () => Promise<void>;
  handleCancel: () => void;
  isLoading: boolean;
}

export const useConfirmModal = (): UseConfirmModalReturn => {
  const [isOpen, setIsOpen] = useState(false);
  const [config, setConfig] = useState<ConfirmModalConfig | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const openConfirm = (newConfig: ConfirmModalConfig) => {
    setConfig(newConfig);
    setIsOpen(true);
  };

  const closeConfirm = () => {
    setIsOpen(false);
    setConfig(null);
    setIsLoading(false);
  };

  const handleConfirm = async () => {
    if (!config) return;

    setIsLoading(true);
    try {
      await config.onConfirm();
      closeConfirm();
    } catch (error) {
      console.error("Confirm action error:", error);
      setIsLoading(false);
      // Don't close modal on error, let user retry
    }
  };

  const handleCancel = () => {
    config?.onCancel?.();
    closeConfirm();
  };

  return {
    isOpen,
    config,
    openConfirm,
    closeConfirm,
    handleConfirm,
    handleCancel,
    isLoading,
  };
}; 