import { useState } from "react";
import { Link } from "react-router-dom";
import { EyeIcon, EyeSlashIcon, ArrowRightIcon } from "@phosphor-icons/react";
import { registerSchema } from "@shared/schemas/auth.schema.js";
import { useAuth } from "@/app/providers/AuthProvider";
import { billingService } from "@/api/billing.service";
import AuthLayout from "@/features/auth/layout";

// Inferir el dominio base del hostname actual para no depender de VITE_BASE_DOMAIN
const _hostParts = window.location.hostname.split(".");
const BASE_DOMAIN = import.meta.env.VITE_BASE_DOMAIN ||
  (_hostParts.length > 2 ? _hostParts.slice(-2).join(".") : window.location.hostname);
const FRONTEND_PORT = window.location.port;

export default function RegisterPage() {
  const { register } = useAuth();
  const [form, setForm] = useState({
    tenant_name: "",
    subdomain: "",
    first_name: "",
    last_name: "",
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const update = (field) => (e) => {
    let value = e.target.value;
    if (field === "subdomain") {
      value = value.toLowerCase().replace(/[^a-z0-9-]/g, "");
    }
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
    setApiError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError(null);

    const result = registerSchema.safeParse(form);
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
      const data = await register(form);
      const port = FRONTEND_PORT ? `:${FRONTEND_PORT}` : "";
      const tenantUrl = `${window.location.protocol}//${form.subdomain}.${BASE_DOMAIN}${port}`;

      try {
        const checkoutUrl = await billingService.getNewTenantCheckoutUrl(form.subdomain, data.token);
        window.location.href = checkoutUrl;
      } catch {
        window.location.href = tenantUrl;
      }
    } catch (err) {
      setApiError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const inputClass = (field) =>
    `w-full px-4 py-3 rounded-xl bg-surface border text-text-primary placeholder:text-text-primary/30 outline-none transition-all duration-200 focus:border-brand focus:ring-2 focus:ring-brand/10 ${errors[field] ? "border-red-400" : "border-border"}`;

  return (
    <AuthLayout>
      <div>
        <h2 className="font-heading text-3xl font-bold text-accent tracking-tight">
          Registra tu negocio en Stylio
        </h2>
        <p className="text-text-primary/50 mt-2 text-[15px]">
          Empieza gratis. Regístrate para empezar a gestionar tu negocio con Stylio.
        </p>
      </div>

      {apiError && (
        <div className="mt-6 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
          {apiError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-10 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="first_name" className="block text-sm font-medium text-text-primary/70 mb-2">
              Nombre
            </label>
            <input
              id="first_name"
              type="text"
              value={form.first_name}
              onChange={update("first_name")}
              placeholder="Ana"
              className={inputClass("first_name")}
            />
            {errors.first_name && <p className="text-red-500 text-xs mt-1.5">{errors.first_name}</p>}
          </div>
          <div>
            <label htmlFor="last_name" className="block text-sm font-medium text-text-primary/70 mb-2">
              Apellido
            </label>
            <input
              id="last_name"
              type="text"
              value={form.last_name}
              onChange={update("last_name")}
              placeholder="García"
              className={inputClass("last_name")}
            />
          </div>
        </div>

        <div>
          <label htmlFor="tenant_name" className="block text-sm font-medium text-text-primary/70 mb-2">
            Nombre del espacio de trabajo
          </label>
          <input
            id="tenant_name"
            type="text"
            value={form.tenant_name}
            onChange={update("tenant_name")}
            placeholder="Mi Salón de Belleza"
            className={inputClass("tenant_name")}
          />
          {errors.tenant_name && <p className="text-red-500 text-xs mt-1.5">{errors.tenant_name}</p>}
        </div>

        <div>
          <label htmlFor="subdomain" className="block text-sm font-medium text-text-primary/70 mb-2">
            URL de acceso
          </label>
          <div className={`flex items-center rounded-xl bg-surface border transition-all duration-200 focus-within:border-brand focus-within:ring-2 focus-within:ring-brand/10 ${errors.subdomain ? "border-red-400" : "border-border"}`}>
            <input
              id="subdomain"
              type="text"
              value={form.subdomain}
              onChange={update("subdomain")}
              placeholder="misalon"
              className="flex-1 px-4 py-3 bg-transparent text-text-primary placeholder:text-text-primary/30 outline-none rounded-l-xl"
            />
            <span className="pr-4 text-sm text-text-primary/30 select-none whitespace-nowrap">
              .stylio.cl
            </span>
          </div>
          {errors.subdomain && <p className="text-red-500 text-xs mt-1.5">{errors.subdomain}</p>}
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-text-primary/70 mb-2">
            Email
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            value={form.email}
            onChange={update("email")}
            placeholder="tu@email.com"
            className={inputClass("email")}
          />
          {errors.email && <p className="text-red-500 text-xs mt-1.5">{errors.email}</p>}
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-text-primary/70 mb-2">
            Contraseña
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              value={form.password}
              onChange={update("password")}
              placeholder="Mínimo 6 caracteres"
              className={`${inputClass("password")} pr-12`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-text-primary/30 hover:text-text-primary/60 transition-colors"
            >
              {showPassword ? <EyeSlashIcon size={16} /> : <EyeIcon size={16} />}
            </button>
          </div>
          {errors.password && <p className="text-red-500 text-xs mt-1.5">{errors.password}</p>}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 bg-brand text-white font-semibold py-3.5 rounded-xl hover:bg-brand-dark transition-all duration-300 hover:scale-[1.01] disabled:opacity-50 disabled:hover:scale-100 mt-6"
        >
          {loading ? (
            <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              Registrar mi negocio
              <ArrowRightIcon size={16} weight="bold" />
            </>
          )}
        </button>
      </form>
    </AuthLayout>
  );
}
