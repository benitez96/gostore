import { useState, useEffect } from 'react';
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from "@heroui/modal";
import { Button } from "@heroui/button";
import { Chip } from "@heroui/chip";
import { RiTimeLine, RiLogoutBoxLine, RiRefreshLine } from "react-icons/ri";

interface IdleWarningProps {
  isVisible: boolean;
  timeRemaining: number; // en milisegundos
  onStayActive: () => void;
  onLogout: () => void;
}

export function IdleWarning({ 
  isVisible, 
  timeRemaining, 
  onStayActive, 
  onLogout 
}: IdleWarningProps) {
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    if (isVisible) {
      setCountdown(Math.ceil(timeRemaining / 1000));
      
      const interval = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            onLogout();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [isVisible, timeRemaining, onLogout]);

  return (
    <Modal 
      isOpen={isVisible} 
      isDismissable={false}
      hideCloseButton={true}
      backdrop="blur"
      size="md"
      placement="center"
      classNames={{
        backdrop: "bg-gradient-to-t from-zinc-900 to-zinc-900/10 backdrop-opacity-20"
      }}
    >
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-warning-100 dark:bg-warning-900/20 rounded-full">
              <RiTimeLine className="text-warning text-xl" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">
                Sesión por vencer
              </h3>
              <p className="text-sm text-default-500 font-normal">
                Has estado inactivo por mucho tiempo
              </p>
            </div>
          </div>
        </ModalHeader>
        
        <ModalBody>
          <div className="text-center py-4">
            <p className="text-default-600 mb-4">
              Tu sesión se cerrará automáticamente en:
            </p>
            
            <div className="flex items-center justify-center gap-2 mb-4">
              <Chip 
                size="lg" 
                color="warning" 
                variant="flat"
                startContent={<RiTimeLine className="text-lg" />}
                classNames={{
                  base: "px-4 py-2",
                  content: "text-xl font-bold"
                }}
              >
                {countdown} segundos
              </Chip>
            </div>
            
            <p className="text-sm text-default-500">
              Haz clic en "Seguir activo" para mantener tu sesión abierta
            </p>
          </div>
        </ModalBody>
        
        <ModalFooter className="justify-center gap-2">
          <Button
            color="default"
            variant="bordered"
            startContent={<RiLogoutBoxLine />}
            onPress={onLogout}
          >
            Cerrar sesión
          </Button>
          <Button
            color="primary"
            variant="solid"
            startContent={<RiRefreshLine />}
            onPress={onStayActive}
          >
            Seguir activo
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
} 