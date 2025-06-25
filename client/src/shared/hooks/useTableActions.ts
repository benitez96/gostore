import { useMemo } from "react";
import { useModalWithData } from "./useModal";
import { useConfirmModal } from "./useConfirmModal";

export interface TableAction<T> {
  label: string;
  icon?: React.ReactNode;
  color?: "default" | "primary" | "secondary" | "success" | "warning" | "danger";
  onAction: (item: T) => void;
  isVisible?: (item: T) => boolean;
}

export interface UseTableActionsOptions<T> {
  onView?: (item: T) => void;
  onEdit?: (item: T) => void;
  onDelete?: (item: T) => void;
}

export interface UseTableActionsReturn<T> {
  // Selection
  selectedItems: Set<string>;
  toggleSelection: (key: string) => void;
  clearSelection: () => void;
  selectAll: (keys: string[]) => void;
  
  // Modals
  editModal: ReturnType<typeof useModalWithData<T>>;
  viewModal: ReturnType<typeof useModalWithData<T>>;
  deleteModal: ReturnType<typeof useConfirmModal>;
  
  // Actions
  handleEdit: (item: T) => void;
  handleView: (item: T) => void;
  handleDelete: (item: T) => void;
  
  // Bulk actions
  bulkDelete: () => void;
  selectedCount: number;
}

export const useTableActions = <T>({
  onView,
  onEdit,
  onDelete,
}: UseTableActionsOptions<T>): TableAction<T>[] => {
  return useMemo(() => {
    const actions: TableAction<T>[] = [];

    if (onView) {
      actions.push({
        label: "Ver",
        color: "primary",
        onAction: onView,
      });
    }

    if (onEdit) {
      actions.push({
        label: "Editar",
        color: "warning",
        onAction: onEdit,
      });
    }

    if (onDelete) {
      actions.push({
        label: "Eliminar",
        color: "danger",
        onAction: onDelete,
      });
    }

    return actions;
  }, [onView, onEdit, onDelete]);
}; 