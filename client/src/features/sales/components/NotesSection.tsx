import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@heroui/button";
import { Tooltip } from "@heroui/tooltip";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from "@heroui/modal";
import { Textarea } from "@heroui/input";
import {
  LiaTrashAltSolid,
  LiaCalendarAltSolid,
  LiaStickyNoteSolid,
  LiaPlusSolid,
} from "react-icons/lia";

import { notesApi } from "@/api";
import { ConfirmModal } from "@/shared/components/feedback";
import { DateDisplay } from "@/shared/components/ui";
import { useToast } from "@/shared/hooks/useToast";

export interface NotesSectionProps {
  saleId: string;
  notes: any[];
}

export function NotesSection({ saleId, notes }: NotesSectionProps) {
  const queryClient = useQueryClient();
  const { showSuccess, showApiError } = useToast();
  
  const [isAddNoteModalOpen, setIsAddNoteModalOpen] = useState(false);
  const [isDeleteNoteModalOpen, setIsDeleteNoteModalOpen] = useState(false);
  const [selectedNote, setSelectedNote] = useState<any>(null);
  const [newNoteContent, setNewNoteContent] = useState("");

  // Mutation for creating notes
  const createNoteMutation = useMutation({
    mutationFn: async ({ saleId, content }: { saleId: string; content: string }) => {
      return await notesApi.create(saleId, content);
    },
    onSuccess: () => {
      showSuccess("Nota agregada", "La nota se ha agregado correctamente.");
      queryClient.invalidateQueries({ queryKey: ["sale-details", saleId] });
      setIsAddNoteModalOpen(false);
      setNewNoteContent("");
    },
    onError: (error) => {
      showApiError("Error al agregar nota", error);
    },
  });

  // Mutation for deleting notes
  const deleteNoteMutation = useMutation({
    mutationFn: async (noteId: string) => {
      return await notesApi.delete(noteId);
    },
    onSuccess: () => {
      showSuccess("Nota eliminada", "La nota se ha eliminado correctamente.");
      queryClient.invalidateQueries({ queryKey: ["sale-details", saleId] });
      setIsDeleteNoteModalOpen(false);
      setSelectedNote(null);
    },
    onError: (error) => {
      showApiError("Error al eliminar nota", error);
    },
  });

  const handleAddNote = () => {
    setIsAddNoteModalOpen(true);
  };

  const handleDeleteNote = (note: any) => {
    setSelectedNote(note);
    setIsDeleteNoteModalOpen(true);
  };

  const confirmAddNote = () => {
    if (!newNoteContent.trim()) return;
    createNoteMutation.mutate({ saleId, content: newNoteContent });
  };

  const confirmDeleteNote = () => {
    if (!selectedNote) return;
    deleteNoteMutation.mutate(selectedNote.id);
  };

  return (
    <>
      {/* Sección de Notas */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-medium flex items-center gap-2">
            <LiaStickyNoteSolid />
            Notas
          </h4>
          <Button
            color="primary"
            size="sm"
            startContent={<LiaPlusSolid />}
            variant="flat"
            onPress={handleAddNote}
          >
            Agregar Nota
          </Button>
        </div>
        
        {!notes || notes.length === 0 ? (
          <div className="text-center py-6 text-default-500 bg-default-50 rounded-lg">
            <LiaStickyNoteSolid className="text-3xl mx-auto mb-2" />
            <p>No hay notas para esta venta</p>
          </div>
        ) : (
          <div className="space-y-3">
            {notes.map((note: any) => (
              <div
                key={note.id}
                className="p-4 bg-default-50 rounded-lg border border-default-200"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-sm text-default-900 mb-2 whitespace-pre-wrap">
                      {note.content}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-default-500">
                      <LiaCalendarAltSolid />
                      <DateDisplay 
                        date={note.created_at} 
                        className="text-xs" 
                        format="datetime"
                      />
                      {note.updated_at && note.updated_at !== note.created_at && (
                        <>
                          <span>•</span>
                          <span>
                            Editado: <DateDisplay 
                              date={note.updated_at} 
                              className="text-xs" 
                              format="datetime"
                            />
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                  <Tooltip content="Eliminar nota">
                    <Button
                      isIconOnly
                      color="danger"
                      size="sm"
                      variant="light"
                      onPress={() => handleDeleteNote(note)}
                    >
                      <LiaTrashAltSolid />
                    </Button>
                  </Tooltip>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de agregar nota */}
      <Modal isOpen={isAddNoteModalOpen} size="md" onClose={() => setIsAddNoteModalOpen(false)}>
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <LiaStickyNoteSolid className="text-2xl text-primary" />
              <span>Agregar Nota</span>
            </div>
          </ModalHeader>
          <ModalBody>
            <div className="space-y-4">
              <Textarea
                isRequired
                description="Escribe una nota sobre esta venta"
                label="Contenido de la nota"
                labelPlacement="outside"
                minRows={3}
                maxRows={8}
                placeholder="Ej: Cliente solicita cambio de fecha de entrega, necesita que se coordine para el próximo viernes..."
                value={newNoteContent}
                onValueChange={setNewNoteContent}
              />
            </div>
          </ModalBody>
          <ModalFooter>
            <Button
              variant="light"
              onPress={() => {
                setIsAddNoteModalOpen(false);
                setNewNoteContent("");
              }}
            >
              Cancelar
            </Button>
            <Button
              color="primary"
              isDisabled={!newNoteContent.trim()}
              isLoading={createNoteMutation.isPending}
              onPress={confirmAddNote}
            >
              Agregar Nota
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Modal de confirmación para eliminar nota */}
      {isDeleteNoteModalOpen && selectedNote && (
        <ConfirmModal
          cancelText="Cancelar"
          confirmText="Eliminar"
          entityInfo={{
            "ID de la nota": `#${selectedNote.id}`,
            "Contenido": selectedNote.content.length > 50 
              ? `${selectedNote.content.substring(0, 50)}...` 
              : selectedNote.content,
            "Fecha de creación": selectedNote.created_at || "Sin fecha",
          }}
          impactList={[
            "Se eliminará la nota permanentemente",
            "No se podrá recuperar el contenido",
            "Esta acción no afectará la venta ni otros datos",
          ]}
          isDangerous={true}
          isLoading={deleteNoteMutation.isPending}
          isOpen={isDeleteNoteModalOpen}
          message="¿Estás seguro de que quieres eliminar esta nota? Esta acción no se puede deshacer."
          title="Eliminar Nota"
          onClose={() => {
            setIsDeleteNoteModalOpen(false);
            setSelectedNote(null);
          }}
          onConfirm={confirmDeleteNote}
        />
      )}
    </>
  );
} 