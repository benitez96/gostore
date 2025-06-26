import { useState } from 'react';
import { User } from '../../../api';
import { useModal, useModalWithData } from '../../../shared/hooks/useModal';

export function useUserActions() {
  // Modals for create/edit
  const createModal = useModal();
  const editModal = useModalWithData<User>();
  
  // Toggle active confirmation
  const [isConfirmToggleOpen, setIsConfirmToggleOpen] = useState(false);
  const [userToToggle, setUserToToggle] = useState<User | null>(null);
  
  // Reset password
  const [isResetPasswordOpen, setIsResetPasswordOpen] = useState(false);
  const [userToResetPassword, setUserToResetPassword] = useState<User | null>(null);

  // Create user actions
  const openCreateModal = () => createModal.open();
  const closeCreateModal = () => createModal.close();

  // Edit user actions
  const openEditModal = (user: User) => editModal.openWith(user);
  const closeEditModal = () => editModal.closeAndClear();

  // Toggle active user actions
  const openToggleConfirm = (user: User) => {
    setUserToToggle(user);
    setIsConfirmToggleOpen(true);
  };

  const closeToggleConfirm = () => {
    setIsConfirmToggleOpen(false);
    setUserToToggle(null);
  };

  // Reset password actions
  const openResetPassword = (user: User) => {
    setUserToResetPassword(user);
    setIsResetPasswordOpen(true);
  };

  const closeResetPassword = () => {
    setIsResetPasswordOpen(false);
    setUserToResetPassword(null);
  };

  return {
    // Create modal
    isCreateModalOpen: createModal.isOpen,
    openCreateModal,
    closeCreateModal,

    // Edit modal
    isEditModalOpen: editModal.isOpen,
    selectedUser: editModal.data,
    openEditModal,
    closeEditModal,

    // Toggle active confirmation
    isConfirmToggleOpen,
    userToToggle,
    openToggleConfirm,
    closeToggleConfirm,

    // Reset password
    isResetPasswordOpen,
    userToResetPassword,
    openResetPassword,
    closeResetPassword,
  };
} 