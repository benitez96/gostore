import { useState, useEffect } from 'react';
import { authApi, User, CreateUserRequest, UpdateUserRequest } from '../../../api';
import { useToast } from '../../../shared/hooks/useToast';

export interface UseUsersState {
  users: User[];
  isLoading: boolean;
  error: string | null;
}

export function useUsers() {
  const [state, setState] = useState<UseUsersState>({
    users: [],
    isLoading: true,
    error: null,
  });

  const { showSuccess, showError } = useToast();

  // Load users (all users - active and inactive)
  const loadUsers = async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      const users = await authApi.getUsers(); // Sin filtro para traer todos
      setState(prev => ({ ...prev, users, isLoading: false }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error loading users';
      setState(prev => ({ ...prev, error: errorMessage, isLoading: false }));
      showError('Error al cargar usuarios', errorMessage);
    }
  };

  // Create user
  const createUser = async (userData: CreateUserRequest): Promise<User | null> => {
    try {
      const newUser = await authApi.createUser(userData);
      setState(prev => ({ 
        ...prev, 
        users: [...prev.users, newUser] 
      }));
      showSuccess('Usuario creado exitosamente');
      return newUser;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error creating user';
      showError('Error al crear usuario', errorMessage);
      return null;
    }
  };

  // Update user
  const updateUser = async (id: number, userData: UpdateUserRequest): Promise<User | null> => {
    try {
      const updatedUser = await authApi.updateUser(id, userData);
      setState(prev => ({
        ...prev,
        users: prev.users.map(user => 
          user.id === id ? updatedUser : user
        ),
      }));
      showSuccess('Usuario actualizado exitosamente');
      return updatedUser;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error updating user';
      showError('Error al actualizar usuario', errorMessage);
      return null;
    }
  };

  // Delete user
  const deleteUser = async (id: number): Promise<boolean> => {
    try {
      await authApi.deleteUser(id);
      setState(prev => ({
        ...prev,
        users: prev.users.filter(user => user.id !== id),
      }));
      showSuccess('Usuario eliminado exitosamente');
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error deleting user';
      showError('Error al eliminar usuario', errorMessage);
      return false;
    }
  };

  // Update user password
  const updateUserPassword = async (id: number, password: string): Promise<boolean> => {
    try {
      await authApi.updateUserPassword(id, { password });
      showSuccess('Contraseña actualizada exitosamente');
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error updating password';
      showError('Error al actualizar contraseña', errorMessage);
      return false;
    }
  };

  // Reset user password to custom password
  const resetUserPassword = async (id: number, newPassword: string): Promise<boolean> => {
    try {
      await authApi.resetUserPassword(id, newPassword);
      showSuccess(`Contraseña blanqueada exitosamente. Nueva contraseña: ${newPassword}`);
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error resetting password';
      showError('Error al blanquear contraseña', errorMessage);
      return false;
    }
  };

  // Toggle user active status
  const toggleUserActive = async (id: number): Promise<boolean> => {
    try {
      const user = state.users.find(u => u.id === id);
      if (!user) {
        showError('Error', 'Usuario no encontrado');
        return false;
      }

      const newActiveStatus = !user.is_active;
      const updatedUser = await authApi.toggleUserActive(id, newActiveStatus);
      
      setState(prev => ({
        ...prev,
        users: prev.users.map(u => 
          u.id === id ? updatedUser : u
        ),
      }));

      const action = newActiveStatus ? 'activado' : 'bloqueado';
      showSuccess(`Usuario ${action} exitosamente`);
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error updating user status';
      showError('Error al cambiar estado del usuario', errorMessage);
      return false;
    }
  };

  // Get user by ID
  const getUserById = async (id: number): Promise<User | null> => {
    try {
      const user = await authApi.getUserById(id);
      return user;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error loading user';
      showError('Error al cargar usuario', errorMessage);
      return null;
    }
  };

  // Load users on mount
  useEffect(() => {
    loadUsers();
  }, []);

  return {
    ...state,
    loadUsers,
    createUser,
    updateUser,
    deleteUser,
    updateUserPassword,
    resetUserPassword,
    toggleUserActive,
    getUserById,
  };
} 