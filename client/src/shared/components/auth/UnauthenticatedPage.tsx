import React, { useEffect } from 'react';
import { Button } from '@heroui/button';
import { Card, CardBody } from '@heroui/card';
import { RiLockLine, RiLoginBoxLine } from 'react-icons/ri';
import { useNavigate, useLocation } from 'react-router-dom';

interface UnauthenticatedPageProps {
  redirectToLogin?: boolean;
  redirectDelay?: number;
}

export function UnauthenticatedPage({ 
  redirectToLogin = false,
  redirectDelay = 2000 
}: UnauthenticatedPageProps) {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (redirectToLogin) {
      const timer = setTimeout(() => {
        navigate('/login', { 
          state: { from: location.pathname },
          replace: true 
        });
      }, redirectDelay);

      return () => clearTimeout(timer);
    }
  }, [redirectToLogin, redirectDelay, navigate, location.pathname]);

  const handleLoginRedirect = () => {
    navigate('/login', { 
      state: { from: location.pathname },
      replace: true 
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-default-100 p-4">
      <Card className="w-full max-w-md">
        <CardBody className="text-center p-8">
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="p-6 bg-warning-50 rounded-full">
              <RiLockLine className="text-5xl text-warning-500" />
            </div>
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold text-foreground mb-3">
            Sesión Requerida
          </h1>

          {/* Message */}
          <p className="text-default-600 mb-2">
            Debes iniciar sesión para acceder a esta página.
          </p>
          
          {redirectToLogin && (
            <p className="text-sm text-default-500 mb-8">
              Serás redirigido al login automáticamente...
            </p>
          )}

          {!redirectToLogin && (
            <p className="text-sm text-default-500 mb-8">
              Haz clic en el botón para iniciar sesión.
            </p>
          )}

          {/* Actions */}
          <div className="flex flex-col gap-3">
            <Button
              color="primary"
              size="lg"
              startContent={<RiLoginBoxLine />}
              onPress={handleLoginRedirect}
              className="w-full"
            >
              Iniciar Sesión
            </Button>
          </div>
        </CardBody>
      </Card>
    </div>
  );
} 