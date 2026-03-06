import { Routes, Route, Navigate } from "react-router-dom";
import { useTenant } from "@/app/TenantProvider";
import PrivateRoute from "@/app/PrivateRoute";
import LandingPage from "@/features/landing/LandingPage";
import LoginPage from "@/features/auth/LoginPage";
import RegisterPage from "@/features/auth/RegisterPage";
import DashboardLayout from "@/features/dashboard/components/DashboardLayout";
import DashboardHome from "@/features/dashboard/DashboardHome";
import CitasPage from "@/features/dashboard/CitasPage";
import ClientesPage from "@/features/dashboard/ClientesPage";
import ServiciosPage from "@/features/dashboard/ServiciosPage";
import ConfiguracionPage from "@/features/dashboard/ConfiguracionPage";

function LandingRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function TenantRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/"
        element={
          // <PrivateRoute>
          // </PrivateRoute>
          <DashboardLayout />
        }
      >
        <Route index element={<DashboardHome />} />
        <Route path="citas" element={<CitasPage />} />
        <Route path="clientes" element={<ClientesPage />} />
        <Route path="servicios" element={<ServiciosPage />} />
        <Route path="configuracion" element={<ConfiguracionPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function AppRouter() {
  const { isTenantApp, loading, error } = useTenant();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-canvas">
        <span className="w-8 h-8 border-3 border-brand/30 border-t-brand rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-canvas">
        <div className="text-center">
          <h1 className="font-heading text-2xl font-bold text-accent">Salón no encontrado</h1>
          <p className="text-text-primary/50 mt-2">El subdominio no corresponde a ningún salón registrado.</p>
        </div>
      </div>
    );
  }

  return isTenantApp ? <TenantRoutes /> : <LandingRoutes />;
}
