import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export function AuthRedirectHandler() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Manejar logout completo - solo redirigir al login cuando se hace logout
    const handleLogoutComplete = () => {
      // Si no está en la página de login, redirigir
      if (location.pathname !== '/login') {
        navigate('/login', { 
          replace: true,
          state: { from: location.pathname }
        });
      }
    };

    // Escuchar eventos de logout
    window.addEventListener('auth:logout:complete', handleLogoutComplete);

    return () => {
      window.removeEventListener('auth:logout:complete', handleLogoutComplete);
    };
  }, [navigate, location.pathname]); // Solo depender del pathname, no del objeto location completo

  return null; // Este componente no renderiza nada
} 