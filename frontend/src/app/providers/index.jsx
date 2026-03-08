import { TenantProvider } from "@/app/providers/TenantProvider";
import { AuthProvider } from "@/app/providers/AuthProvider";
import { ToastProvider } from "@/components/Toast";

export default function Providers({ children }) {
  return (
    <TenantProvider>
      <AuthProvider>
        <ToastProvider>
          {children}
        </ToastProvider>
      </AuthProvider>
    </TenantProvider>
  );
}
