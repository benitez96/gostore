import { useState, useEffect, useCallback, useRef } from 'react';

interface UseIdleOptions {
  timeout: number; // timeout in milliseconds
  onIdle?: () => void;
  onActive?: () => void;
  events?: string[];
  element?: Element | Document;
  paused?: boolean; // Pausar temporalmente la detección
}

const defaultEvents = [
  'mousedown',
  'mousemove',
  'keypress',
  'scroll',
  'touchstart',
  'click',
];



export function useIdle({
  timeout = 5 * 60 * 1000, // 5 minutos por defecto
  onIdle,
  onActive,
  events = defaultEvents,
  element = document,
  paused = false,
}: UseIdleOptions) {
  const [isIdle, setIsIdle] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout>();
  const lastActivityRef = useRef(Date.now());

  const reset = useCallback(() => {
    // Si está pausado, no resetear
    if (paused) {
      return;
    }
    
    lastActivityRef.current = Date.now();
    
    if (isIdle) {
      setIsIdle(false);
      onActive?.();
    }

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set new timeout
    timeoutRef.current = setTimeout(() => {
      setIsIdle(true);
      onIdle?.();
    }, timeout);
  }, [isIdle, onActive, onIdle, timeout, paused]);

  const forceIdle = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsIdle(true);
    onIdle?.();
  }, [onIdle]);

  const forceActive = useCallback(() => {
    reset();
  }, [reset]);

  useEffect(() => {
    // Bind event listeners
    events.forEach((event) => {
      element.addEventListener(event, reset, true);
    });

    // Initialize timer
    reset();

    // Cleanup function
    return () => {
      events.forEach((event) => {
        element.removeEventListener(event, reset, true);
      });
      
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [reset, events, element]);

  // Get time remaining until idle
  const getTimeRemaining = useCallback(() => {
    const elapsed = Date.now() - lastActivityRef.current;
    return Math.max(0, timeout - elapsed);
  }, [timeout]);

  // Get time since last activity
  const getTimeSinceLastActivity = useCallback(() => {
    return Date.now() - lastActivityRef.current;
  }, []);

  return {
    isIdle,
    forceIdle,
    forceActive,
    reset,
    getTimeRemaining,
    getTimeSinceLastActivity,
    lastActivity: lastActivityRef.current,
  };
} 