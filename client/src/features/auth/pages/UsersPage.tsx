import { Button } from "@heroui/button";
import { Modal, ModalContent, ModalHeader, ModalBody } from "@heroui/modal";
import { RiUserAddLine, RiUserLine, RiSettings3Line } from "react-icons/ri";
import { IoPersonAddOutline } from "react-icons/io5";

import DefaultLayout from "@/layouts/default";
import { useUsers, useUserActions } from "../hooks";
import { UserForm, UserCard, ResetPasswordModal } from "../components";
import { LoadingSpinner, EmptyState, ConfirmModal } from "@/shared/components/feedback";
import { CreateUserRequest, UpdateUserRequest } from "@/api";
import { getUserRole } from "@/shared/hooks/useAuth";
import { useState } from "react";

export default function UsersPage() {
  const { users, isLoading, createUser, updateUser, resetUserPassword, toggleUserActive } = useUsers();
  const {
    // Create modal
    isCreateModalOpen,
    openCreateModal,
    closeCreateModal,
    // Edit modal
    isEditModalOpen,
    selectedUser,
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
  } = useUserActions();

  const [isDeleting, setIsDeleting] = useState(false);

  // Create user handler
  const handleCreateUser = async (data: CreateUserRequest | UpdateUserRequest) => {
    const userData = data as CreateUserRequest;
    const newUser = await createUser(userData);
    if (newUser) {
      closeCreateModal();
    }
  };

  // Update user handler
  const handleUpdateUser = async (data: CreateUserRequest | UpdateUserRequest) => {
    const userData = data as UpdateUserRequest;
    if (selectedUser) {
      const updatedUser = await updateUser(selectedUser.id, userData);
      if (updatedUser) {
        closeEditModal();
      }
    }
  };

  // Toggle user active handler
  const handleConfirmToggle = async () => {
    if (userToToggle) {
      setIsDeleting(true);
      const success = await toggleUserActive(userToToggle.id);
      if (success) {
        closeToggleConfirm();
      }
      setIsDeleting(false);
    }
  };

  // Reset password handler
  const handleResetPassword = async (newPassword: string) => {
    if (userToResetPassword) {
      await resetUserPassword(userToResetPassword.id, newPassword);
      closeResetPassword();
    }
  };

  if (isLoading) {
    return (
      <DefaultLayout>
        <div className="flex justify-center items-center min-h-[400px]">
          <LoadingSpinner />
        </div>
      </DefaultLayout>
    );
  }

  return (
    <DefaultLayout>
      <section className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex items-center justify-between max-w-7xl w-full px-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl">
              <RiUserLine className="text-white text-2xl" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
                Gestión de Usuarios
              </h1>
              <p className="text-default-500">Administra los usuarios del sistema</p>
            </div>
          </div>
          
          <Button
            color="primary"
            startContent={<RiUserAddLine />}
            onPress={openCreateModal}
          >
            Crear Usuario
          </Button>
        </div>

        {/* Content */}
        <div className="max-w-7xl w-full px-4">
          {users.length === 0 ? (
            <EmptyState
              title="No hay usuarios"
              description="Crea el primer usuario del sistema"
              action={{
                label: "Crear Usuario",
                onAction: openCreateModal,
                icon: <RiUserAddLine />
              }}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {users.map((user) => (
                <UserCard
                  key={user.id}
                  user={user}
                  onEdit={openEditModal}
                  onToggleActive={openToggleConfirm}
                  onResetPassword={openResetPassword}
                />
              ))}
            </div>
          )}
        </div>

        {/* Create User Modal */}
        <Modal 
          isOpen={isCreateModalOpen} 
          onClose={closeCreateModal}
          size="2xl"
          scrollBehavior="inside"
        >
          <ModalContent>
            <ModalHeader className="flex flex-col gap-1 pb-0 pt-8 px-8">
              <div className="flex items-center gap-2 mb-4">
                <IoPersonAddOutline className="text-2xl text-primary" />
                <h2 className="text-xl font-semibold text-foreground">
                  Crear Nuevo Usuario
                </h2>
              </div>            
            </ModalHeader>
            <ModalBody className="pb-6">
              <UserForm
                mode="create"
                onSubmit={handleCreateUser}
                onCancel={closeCreateModal}
                isLoading={isLoading}
              />
            </ModalBody>
          </ModalContent>
        </Modal>

        {/* Edit User Modal */}
        <Modal 
          isOpen={isEditModalOpen} 
          onClose={closeEditModal}
          size="2xl"
          scrollBehavior="inside"
        >
          <ModalContent>
            <ModalHeader className="flex flex-col gap-1 pb-0 pt-8 px-8">
              <div className="flex items-center gap-2 mb-4">
                <RiSettings3Line className="text-2xl text-primary" />
                <h2 className="text-xl font-semibold text-foreground">
                  Editar Usuario
                </h2>
              </div>            
            </ModalHeader>
            <ModalBody className="pb-6">
              <UserForm
                mode="edit"
                user={selectedUser}
                onSubmit={handleUpdateUser}
                onCancel={closeEditModal}
                isLoading={isLoading}
              />
            </ModalBody>
          </ModalContent>
        </Modal>

        {/* Toggle Active Confirmation Modal */}
        <ConfirmModal
          isOpen={isConfirmToggleOpen}
          onClose={closeToggleConfirm}
          onConfirm={handleConfirmToggle}
          title={userToToggle?.is_active ? "Bloquear Usuario" : "Activar Usuario"}
          message={`¿Estás seguro de que deseas ${userToToggle?.is_active ? "bloquear" : "activar"} al usuario "${userToToggle?.username}"?`}
          confirmText={userToToggle?.is_active ? "Bloquear" : "Activar"}
          cancelText="Cancelar"
          isLoading={isDeleting}
          isDangerous={userToToggle?.is_active}
          entityInfo={userToToggle ? {
            "Usuario": userToToggle.username,
            "Nombre": `${userToToggle.firstName} ${userToToggle.lastName}`,
            "Rol": getUserRole(userToToggle.permissions),
            "Estado actual": userToToggle.is_active ? "Activo" : "Inactivo"
          } : undefined}
        />

        {/* Reset Password Modal */}
        <ResetPasswordModal
          isOpen={isResetPasswordOpen}
          onClose={closeResetPassword}
          onConfirm={handleResetPassword}
          user={userToResetPassword}
          isLoading={isLoading}
        />
      </section>
    </DefaultLayout>
  );
} 