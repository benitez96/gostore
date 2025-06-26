import { Route, Routes } from "react-router-dom";

import IndexPage from "@/pages/index";
import DashboardPage from "@/features/dashboard/pages/DashboardPage";
import ClientsPage from "@/features/clients/pages/ClientsPage";
import ClientDetailPage from "@/features/clients/pages/ClientDetailPage";
import ProductsPage from "@/features/products/pages/ProductsPage";
import { LoginPage, UsersPage } from "@/features/auth";

function App() {
  return (
    <Routes>
      <Route element={<IndexPage />} path="/" />
      <Route element={<LoginPage />} path="/login" />
      <Route element={<UsersPage />} path="/usuarios" />
      <Route element={<DashboardPage />} path="/dashboard" />
      <Route element={<ClientsPage />} path="/clientes" />
      <Route element={<ClientDetailPage />} path="/clientes/:id" />
      <Route element={<ProductsPage />} path="/productos" />
    </Routes>
  );
}

export default App;
