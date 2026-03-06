import { BrowserRouter } from "react-router-dom";
import { ToastProvider } from "@/components/Toast";
import { TenantProvider } from "@/app/TenantProvider";
import { AuthProvider } from "@/app/AuthProvider";
import AppRouter from "@/app/router";

export default function App() {
  return (
    <BrowserRouter>
      <TenantProvider>
        <AuthProvider>
          <ToastProvider>
            <AppRouter />
          </ToastProvider>
        </AuthProvider>
      </TenantProvider>
    </BrowserRouter>
  );
}
