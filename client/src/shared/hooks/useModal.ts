import { useState } from "react";

export interface UseModalReturn {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
}

export const useModal = (initialState: boolean = false): UseModalReturn => {
  const [isOpen, setIsOpen] = useState(initialState);

  const open = () => setIsOpen(true);
  const close = () => setIsOpen(false);
  const toggle = () => setIsOpen(!isOpen);

  return {
    isOpen,
    open,
    close,
    toggle,
  };
};

export interface UseModalWithDataReturn<T> extends UseModalReturn {
  data: T | null;
  openWith: (data: T) => void;
  closeAndClear: () => void;
}

export const useModalWithData = <T>(
  initialState: boolean = false
): UseModalWithDataReturn<T> => {
  const [isOpen, setIsOpen] = useState(initialState);
  const [data, setData] = useState<T | null>(null);

  const open = () => setIsOpen(true);
  const close = () => setIsOpen(false);
  const toggle = () => setIsOpen(!isOpen);

  const openWith = (newData: T) => {
    setData(newData);
    setIsOpen(true);
  };

  const closeAndClear = () => {
    setIsOpen(false);
    setData(null);
  };

  return {
    isOpen,
    data,
    open,
    close,
    toggle,
    openWith,
    closeAndClear,
  };
}; 