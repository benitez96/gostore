import { useState, useRef, useEffect } from "react";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Form } from "@heroui/form";
import { RiEyeLine, RiEyeOffLine, RiLockLine, RiUserLine } from "react-icons/ri";

interface LoginFormData {
  username: string;
  password: string;
}

interface LoginFormProps {
  onSubmit: (data: LoginFormData) => Promise<void>;
  isLoading?: boolean;
  validationErrors?: Record<string, string>;
}

export default function LoginForm({ onSubmit, isLoading = false, validationErrors }: LoginFormProps) {
  const [formData, setFormData] = useState<LoginFormData>({
    username: "",
    password: "",
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const usernameInputRef = useRef<HTMLInputElement>(null);

  // Focus en el campo username cuando el componente se monta
  useEffect(() => {
    if (usernameInputRef.current) {
      usernameInputRef.current.focus();
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  // Validation functions following HeroUI best practices
  const validateUsername = (value: string) => {
    if (!value.trim()) {
      return "El usuario es requerido";
    }
    if (value.length < 3) {
      return "El usuario debe tener al menos 3 caracteres";
    }
    return null;
  };

  const validatePassword = (value: string) => {
    if (!value.trim()) {
      return "La contraseña es requerida";
    }
    if (value.length < 6) {
      return "La contraseña debe tener al menos 6 caracteres";
    }
    return null;
  };

  // Check if form is valid for button state
  const isFormValid = 
    formData.username.trim().length >= 3 && 
    formData.password.trim().length >= 6;

  return (
    <Card 
      className="w-full max-w-md mx-auto"
      shadow="lg"
    >
      <CardHeader className="pb-0 pt-8 px-8 flex-col items-center">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center mb-4">
          <RiLockLine className="text-white text-2xl" />
        </div>
        <h1 className="text-2xl font-bold text-center mb-2">Iniciar Sesión</h1>
        <p className="text-sm text-default-500 text-center">
          Ingresa tus credenciales para acceder al sistema
        </p>
      </CardHeader>
      
      <CardBody className="px-6 pb-6 pt-4">
        <Form
          onSubmit={handleSubmit}
          validationErrors={validationErrors}
          validationBehavior="native"
          className="space-y-6"
        >
          <div className="space-y-4 w-full">
            {/* Campo Usuario */}
            <Input
              ref={usernameInputRef}
              name="username"
              type="text"
              label="Usuario"
              placeholder="Ingresa tu usuario"
              value={formData.username}
              onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
              validate={validateUsername}
              autoComplete="off"
              startContent={
                <RiUserLine className="text-xl text-default-400 pointer-events-none flex-shrink-0" />
              }
              variant="bordered"
              size="lg"
              classNames={{
                inputWrapper: "border-2 hover:border-primary-400 focus-within:border-primary-500",
              }}
              isRequired
              minLength={3}
            />

            {/* Campo Contraseña */}
            <Input
              name="password"
              type={showPassword ? "text" : "password"}
              label="Contraseña"
              placeholder="Ingresa tu contraseña"
              value={formData.password}
              onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
              validate={validatePassword}
              autoComplete="off"
              startContent={
                <RiLockLine className="text-xl text-default-400 pointer-events-none flex-shrink-0" />
              }
              endContent={
                <Button
                  isIconOnly
                  variant="light"
                  size="sm"
                  type="button"
                  radius="full"
                  onPress={() => setShowPassword(!showPassword)}
                  aria-label="toggle password visibility"
                >
                  {showPassword ? (
                    <RiEyeOffLine className="text-xl text-default-400" />
                  ) : (
                    <RiEyeLine className="text-xl text-default-400" />
                  )}
                </Button>
              }
              variant="bordered"
              size="lg"
              classNames={{
                inputWrapper: "border-2 hover:border-primary-400 focus-within:border-primary-500",
              }}
              isRequired
              minLength={6}
            />
          </div>

          {/* Botón de envío */}
          <Button
            type="submit"
            className="w-full font-semibold"
            color="primary"
            size="lg"
            isLoading={isLoading}
            isDisabled={!isFormValid || isLoading}
            radius="md"
          >
            {isLoading ? "Iniciando sesión..." : "Iniciar Sesión"}
          </Button>

        </Form>
      </CardBody>
    </Card>
  );
} 