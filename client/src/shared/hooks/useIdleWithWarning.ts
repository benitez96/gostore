import { useState, useCallback, useEffect, useRef } from 'react';
import { useIdle } from './useIdle';

interface UseIdleWithWarningOptions {
  idleTimeout?: number; // Tiempo total de inactividad (por defecto 5 minutos)
  warningTimeout?: number; // Tiempo para mostrar warning antes del logout (por defecto 30 segundos)
  onLogout: () => void;
}

export function useIdleWithWarning({
  idleTimeout = 5 * 60 * 1000, // 5 minutos
  warningTimeout = 30 * 1000, // 30 segundos de warning
  onLogout,
}: UseIdleWithWarningOptions) {
  const [showWarning, setShowWarning] = useState(false);
  const [warningTimeRemaining, setWarningTimeRemaining] = useState(0);
  const warningIntervalRef = useRef<NodeJS.Timeout>();

  // Tiempo efectivo antes de mostrar warning
  const effectiveTimeout = idleTimeout - warningTimeout;

  const startWarningCountdown = useCallback(() => {
    setWarningTimeRemaining(warningTimeout);
    
    warningIntervalRef.current = setInterval(() => {
      setWarningTimeRemaining((prev) => {
        const newTime = prev - 1000;
        
        if (newTime <= 0) {
          setShowWarning(false);
          onLogout();
          return 0;
        }
        
        return newTime;
      });
    }, 1000);
  }, [warningTimeout, onLogout]);

  const stopWarningCountdown = useCallback(() => {
    if (warningIntervalRef.current) {
      clearInterval(warningIntervalRef.current);
      warningIntervalRef.current = undefined;
    }
    setWarningTimeRemaining(0);
  }, []);

  const handleIdle = useCallback(() => {
    setShowWarning(true);
    startWarningCountdown();
  }, [startWarningCountdown]);

  const handleActive = useCallback(() => {
    // NO ocultar automáticamente el warning - solo por acción manual
  }, []);

  const { 
    isIdle, 
    forceActive, 
    forceIdle, 
    reset, 
    getTimeRemaining,
    getTimeSinceLastActivity 
  } = useIdle({
    timeout: effectiveTimeout,
    onIdle: handleIdle,
    onActive: handleActive,
    paused: showWarning, // Pausar cuando se muestra el warning
  });

  const stayActive = useCallback(() => {
    setShowWarning(false);
    stopWarningCountdown();
    forceActive();
  }, [forceActive, stopWarningCountdown]);

  const forceLogout = useCallback(() => {
    setShowWarning(false);
    stopWarningCountdown();
    onLogout();
  }, [onLogout, stopWarningCountdown]);

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (warningIntervalRef.current) {
        clearInterval(warningIntervalRef.current);
      }
    };
  }, []);

  return {
    // Estados
    isIdle,
    showWarning,
    warningTimeRemaining,
    
    // Acciones
    stayActive,
    forceLogout,
    forceIdle,
    reset,
    
    // Información
    getTimeRemaining,
    getTimeSinceLastActivity,
    totalIdleTime: idleTimeout,
    warningTime: warningTimeout,
  };
} 