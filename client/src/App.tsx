import { Route, Routes } from "react-router-dom";

import IndexPage from "@/pages/index";
import DashboardPage from "@/features/dashboard/pages/DashboardPage";
import ClientsPage from "@/features/clients/pages/ClientsPage";
import ClientDetailPage from "@/features/clients/pages/ClientDetailPage";
import ProductsPage from "@/features/products/pages/ProductsPage";

function App() {
  return (
    <Routes>
      <Route element={<IndexPage />} path="/" />
      <Route element={<DashboardPage />} path="/dashboard" />
      <Route element={<ClientsPage />} path="/clientes" />
      <Route element={<ClientDetailPage />} path="/clientes/:id" />
      <Route element={<ProductsPage />} path="/productos" />
    </Routes>
  );
}

export default App;
