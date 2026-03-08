import { Routes, Route, Navigate } from "react-router-dom";
import { useTenant } from "@/app/providers/TenantProvider";
import PrivateRoute from "@/app/routes/PrivateRoute";
import LandingPage from "@/features/landing/page";
import LoginPage from "@/features/auth/login/page";
import RegisterPage from "@/features/auth/register/page";
import DashboardLayout from "@/features/dashboard/components/DashboardLayout";
import HomePage from "@/features/dashboard/home/page";
import AppointmentsPage from "@/features/dashboard/appointments/page";
import ClientsPage from "@/features/dashboard/clients/page";
import ServicesPage from "@/features/dashboard/services/page";
import SettingsPage from "@/features/dashboard/settings/page";

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
          <PrivateRoute>
            <DashboardLayout />
          </PrivateRoute>
        }
      >
        <Route index element={<HomePage />} />
        <Route path="citas" element={<AppointmentsPage />} />
        <Route path="clientes" element={<ClientsPage />} />
        <Route path="servicios" element={<ServicesPage />} />
        <Route path="configuracion" element={<SettingsPage />} />
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
