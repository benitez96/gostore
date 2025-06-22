import { Route, Routes } from "react-router-dom";

import IndexPage from "@/pages/index";
import DashboardPage from "@/pages/dashboard";
import ClientesPage from "@/pages/clientes";
import ProductosPage from "@/pages/productos";
import ClienteDetallePage from "@/pages/cliente-detalle";

function App() {
  return (
    <Routes>
      <Route element={<IndexPage />} path="/" />
      <Route element={<DashboardPage />} path="/dashboard" />
      <Route element={<ClientesPage />} path="/clientes" />
      <Route element={<ClienteDetallePage />} path="/clientes/:id" />
      <Route element={<ProductosPage />} path="/productos" />
    </Routes>
  );
}

export default App;
