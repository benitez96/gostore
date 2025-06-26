import React from 'react';
import { Button } from '@heroui/button';
import { Card, CardBody } from '@heroui/card';
import { RiShieldCrossLine, RiHomeLine, RiArrowLeftLine } from 'react-icons/ri';
import { useNavigate } from 'react-router-dom';

interface UnauthorizedPageProps {
  title?: string;
  message?: string;
  showBackButton?: boolean;
}

export function UnauthorizedPage({ 
  title = "Acceso Denegado",
  message = "No tienes permisos para acceder a esta sección.",
  showBackButton = true 
}: UnauthorizedPageProps) {
  const navigate = useNavigate();

  const handleGoHome = () => {
    navigate('/');
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-default-100 p-4">
      <Card className="w-full max-w-md">
        <CardBody className="text-center p-8">
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="p-6 bg-danger-50 rounded-full">
              <RiShieldCrossLine className="text-5xl text-danger-500" />
            </div>
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold text-foreground mb-3">
            {title}
          </h1>

          {/* Message */}
          <p className="text-default-600 mb-2">
            {message}
          </p>
          
          <p className="text-sm text-default-500 mb-8">
            Contacta con tu administrador si crees que esto es un error.
          </p>

          {/* Actions */}
          <div className="flex flex-col gap-3">
            <Button
              color="primary"
              size="lg"
              startContent={<RiHomeLine />}
              onPress={handleGoHome}
              className="w-full"
            >
              Ir al Inicio
            </Button>
            
            {showBackButton && (
              <Button
                variant="bordered"
                size="lg"
                startContent={<RiArrowLeftLine />}
                onPress={handleGoBack}
                className="w-full"
              >
                Volver Atrás
              </Button>
            )}
          </div>
        </CardBody>
      </Card>
    </div>
  );
} 