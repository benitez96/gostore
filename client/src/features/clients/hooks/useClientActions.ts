import { useQueryClient } from "@tanstack/react-query";
import { useAsyncAction } from "@/shared/hooks/useAsyncAction";
import { clientsApi, ClientDetail } from "../api/clientsApi";

export const useClientActions = () => {
  const queryClient = useQueryClient();

  const createAction = useAsyncAction(
    async (clientData: Omit<ClientDetail, "id">) => {
      await clientsApi.create(clientData);
      queryClient.invalidateQueries({ queryKey: ["clients"] });
    },
    {
      successMessage: "El cliente se ha creado exitosamente",
      errorMessage: "Error al crear cliente",
    }
  );

  const updateAction = useAsyncAction(
    async (id: string, clientData: Omit<ClientDetail, "id">) => {
      await clientsApi.update(id, clientData);
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      queryClient.invalidateQueries({ queryKey: ["client", id] });
    },
    {
      successMessage: "El cliente se ha actualizado exitosamente",
      errorMessage: "Error al actualizar cliente",
    }
  );

  const deleteAction = useAsyncAction(
    async (id: string) => {
      await clientsApi.delete(id);
      queryClient.invalidateQueries({ queryKey: ["clients"] });
    },
    {
      successMessage: "El cliente se ha eliminado exitosamente",
      errorMessage: "Error al eliminar cliente",
    }
  );

  return {
    create: createAction,
    update: updateAction,
    delete: deleteAction,
  };
}; 