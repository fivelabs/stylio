import { useState } from "react";
import { Navigate } from "react-router-dom";
import { Eye, EyeOff, ArrowRight } from "lucide-react";
import { loginSchema } from "@shared/schemas/auth.schema.js";
import { useAuth } from "@/app/providers/AuthProvider";
import { useTenant } from "@/app/providers/TenantProvider";
import AuthLayout from "@/features/auth/layout";

export default function LoginPage() {
  const { login, isAuthenticated } = useAuth();
  const { tenant } = useTenant();
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  if (isAuthenticated) return <Navigate to="/" replace />;

  const update = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
    setApiError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError(null);

    const result = loginSchema.safeParse(form);
    if (!result.success) {
      const fieldErrors = {};
      result.error.issues.forEach((issue) => {
        const key = issue.path[0];
        if (!fieldErrors[key]) fieldErrors[key] = issue.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setLoading(true);
    try {
      await login(form.email, form.password);
    } catch (err) {
      setApiError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div>
        <h2 className="font-heading text-3xl font-bold text-accent tracking-tight">
          Bienvenido de vuelta
        </h2>
        <p className="text-text-primary/50 mt-2 text-[15px]">
          {tenant
            ? `Ingresa a tu cuenta en ${tenant.name}.`
            : "Ingresa a tu cuenta para gestionar tu espacio de trabajo."}
        </p>
      </div>

      {apiError && (
        <div className="mt-6 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
          {apiError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-10 space-y-5">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-text-primary/70 mb-2">
            Email
          </label>
          <input
            id="email"
            type="email"
            autoComplete="username"
            value={form.email}
            onChange={update("email")}
            placeholder="tu@email.com"
            className={`w-full px-4 py-3 rounded-xl bg-surface border text-text-primary placeholder:text-text-primary/30 outline-none transition-all duration-200 focus:border-brand focus:ring-2 focus:ring-brand/10 ${errors.email ? "border-red-400" : "border-border"}`}
          />
          {errors.email && <p className="text-red-500 text-xs mt-1.5">{errors.email}</p>}
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label htmlFor="password" className="block text-sm font-medium text-text-primary/70">
              Contraseña
            </label>
            <button
              type="button"
              className="text-xs text-brand hover:text-brand-dark transition-colors font-medium"
            >
              ¿Olvidaste tu contraseña?
            </button>
          </div>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              value={form.password}
              onChange={update("password")}
              placeholder="••••••••"
              className={`w-full px-4 py-3 rounded-xl bg-surface border text-text-primary placeholder:text-text-primary/30 outline-none transition-all duration-200 focus:border-brand focus:ring-2 focus:ring-brand/10 pr-12 ${errors.password ? "border-red-400" : "border-border"}`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-text-primary/30 hover:text-text-primary/60 transition-colors"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {errors.password && <p className="text-red-500 text-xs mt-1.5">{errors.password}</p>}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 bg-brand text-white font-semibold py-3.5 rounded-xl hover:bg-brand-dark transition-all duration-300 hover:scale-[1.01] disabled:opacity-50 disabled:hover:scale-100 mt-8"
        >
          {loading ? (
            <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              Iniciar sesión
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      <p className="mt-8 text-center text-sm text-text-primary/40">
        Contacta al administrador de tu espacio si no tienes acceso.
      </p>
    </AuthLayout>
  );
}
