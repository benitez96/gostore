import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { RiShoppingBagLine } from "react-icons/ri";

import LoginForm from "../components/LoginForm";
import { siteConfig } from "@/config/site";
import { ThemeSwitch } from "@/components/theme-switch";
import { useAuthContext } from "@/components/AuthProvider";

interface LoginFormData {
  username: string;
  password: string;
}

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated } = useAuthContext();

  // Si ya está autenticado, redirigir
  useEffect(() => {
    if (isAuthenticated) {
      const from = location.state?.from || '/';
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, location.state]);

  const handleLogin = async (data: LoginFormData) => {
    setIsLoading(true);
    
    try {
      await login(data.username, data.password);
      
    } catch (error) {
      // TODO: Show error message to user
    } finally {
      setIsLoading(false);
    }
  };

  // Si ya está autenticado, no mostrar el formulario
  if (isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-background to-default-50 relative">
      {/* Theme Switch en la esquina superior derecha */}
      <div className="absolute top-6 right-6">
        <ThemeSwitch />
      </div>

      {/* Logo y título en la parte superior */}
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <RiShoppingBagLine className="text-3xl text-primary" />
            <h1 className="text-2xl font-bold">{siteConfig.name}</h1>
          </div>
          <p className="text-default-500">{siteConfig.description}</p>
        </div>

        {/* Formulario de login */}
        <LoginForm onSubmit={handleLogin} isLoading={isLoading} />

      </div>
    </div>
  );
} 
