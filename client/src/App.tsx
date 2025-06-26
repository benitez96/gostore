import { Route, Routes } from "react-router-dom";

import IndexPage from "@/pages/index";
import DashboardPage from "@/features/dashboard/pages/DashboardPage";
import ClientsPage from "@/features/clients/pages/ClientsPage";
import ClientDetailPage from "@/features/clients/pages/ClientDetailPage";
import ProductsPage from "@/features/products/pages/ProductsPage";
import { LoginPage, UsersPage } from "@/features/auth";
import { AuthProvider, ProtectedRoute } from "@/components/AuthProvider";
import { PERMISSIONS } from "@/shared/hooks/useAuth";

function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Rutas públicas */}
        <Route element={<IndexPage />} path="/" />
        <Route element={<LoginPage />} path="/login" />
        
        {/* Rutas protegidas con permisos específicos */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute requiredPermissions={[PERMISSIONS.DASHBOARD]}>
              <DashboardPage />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/clientes" 
          element={
            <ProtectedRoute requiredPermissions={[PERMISSIONS.CLIENTES]}>
              <ClientsPage />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/clientes/:id" 
          element={
            <ProtectedRoute requiredPermissions={[PERMISSIONS.CLIENTES]}>
              <ClientDetailPage />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/productos" 
          element={
            <ProtectedRoute requiredPermissions={[PERMISSIONS.PRODUCTOS]}>
              <ProductsPage />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/usuarios" 
          element={
            <ProtectedRoute requiredPermissions={[PERMISSIONS.USUARIOS]}>
              <UsersPage />
            </ProtectedRoute>
          } 
        />
      </Routes>
    </AuthProvider>
  );
}

export default App;
