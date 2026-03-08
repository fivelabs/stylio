import { useEffect, useState } from "react";
import { useTenant } from "@/app/providers/TenantProvider";
import { preferencesService } from "@/api/preferences.service";

const COLOR_KEYS = [
  { key: "brand", label: "Marca" },
  { key: "accent", label: "Acento" },
  { key: "brand-dark", label: "Marca oscuro" },
  { key: "text-primary", label: "Texto principal" },
  { key: "canvas", label: "Fondo" },
  { key: "surface", label: "Superficie" },
  { key: "border", label: "Borde" },
];

const DEFAULT_THEME_COLORS = {
  brand: "#8D7B68",
  accent: "#1A1A1A",
  "brand-dark": "#6B5D4D",
  "text-primary": "#2D2D2D",
  canvas: "#FDFDFD",
  surface: "#F4F4F2",
  border: "#E5E5E3",
};

const defaultColors = Object.fromEntries(COLOR_KEYS.map(({ key }) => [key, ""]));

function defaultForm(preferences) {
  const colors = preferences?.colors && typeof preferences.colors === "object"
    ? { ...defaultColors, ...preferences.colors }
    : { ...defaultColors };

  return {
    visible_name: preferences?.visible_name ?? "",
    logo_url: preferences?.logo_url ?? "",
    banner_horizontal_url: preferences?.banner_horizontal_url ?? "",
    banner_vertical_url: preferences?.banner_vertical_url ?? "",
    colors,
  };
}

export default function SettingsPage() {
  const { preferences, refreshPreferences } = useTenant();
  const [form, setForm] = useState(() => defaultForm(preferences));
  const [saving, setSaving] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    setForm(defaultForm(preferences));
  }, [preferences]);

  const update = (field) => (e) => {
    const value = e.target.value;
    setForm((prev) => ({ ...prev, [field]: value }));
    setError(null);
    setSuccess(false);
  };

  const updateColor = (key) => (e) => {
    const value = e.target.value;
    setForm((prev) => ({
      ...prev,
      colors: { ...prev.colors, [key]: value },
    }));
    setError(null);
    setSuccess(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setSaving(true);

    const payload = {
      visible_name: form.visible_name.trim() || undefined,
      logo_url: form.logo_url.trim() || null,
      banner_horizontal_url: form.banner_horizontal_url.trim() || null,
      banner_vertical_url: form.banner_vertical_url.trim() || null,
    };

    const colorsPayload = {};
    COLOR_KEYS.forEach(({ key }) => {
      const v = form.colors[key]?.trim();
      if (v && /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(v)) colorsPayload[key] = v;
    });
    if (Object.keys(colorsPayload).length > 0) payload.colors = colorsPayload;

    try {
      await preferencesService.update(payload);
      await refreshPreferences();
      setSuccess(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleResetColors = async () => {
    setError(null);
    setSuccess(false);
    setResetting(true);
    try {
      await preferencesService.update({
        visible_name: form.visible_name.trim() || null,
        logo_url: form.logo_url.trim() || null,
        banner_horizontal_url: form.banner_horizontal_url.trim() || null,
        banner_vertical_url: form.banner_vertical_url.trim() || null,
        colors: null,
      });
      await refreshPreferences();
      setForm((prev) => ({ ...prev, colors: { ...defaultColors } }));
      setSuccess(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setResetting(false);
    }
  };

  const inputClass = "w-full px-4 py-2.5 rounded-xl bg-surface border border-border text-text-primary placeholder:text-text-primary/30 outline-none focus:border-brand focus:ring-2 focus:ring-brand/10";

  return (
    <div className="p-8 max-w-2xl">
      <h1 className="font-heading text-2xl font-bold text-accent">Configuración</h1>
      <p className="text-text-primary/50 mt-1 text-sm">Personaliza el nombre visible, logo, colores y banners de tu negocio.</p>

      {error && (
        <div className="mt-6 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
          {error}
        </div>
      )}
      {success && (
        <div className="mt-6 px-4 py-3 rounded-xl bg-green-50 border border-green-200 text-green-700 text-sm">
          Preferencias guardadas correctamente.
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-8 space-y-8">
        <section>
          <h2 className="font-semibold text-accent mb-4">Marca</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-primary/70 mb-1.5">Nombre visible</label>
              <input
                type="text"
                value={form.visible_name}
                onChange={update("visible_name")}
                placeholder="Nombre que verán tus clientes"
                maxLength={150}
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary/70 mb-1.5">URL del logo</label>
              <input
                type="url"
                value={form.logo_url}
                onChange={update("logo_url")}
                placeholder="https://..."
                className={inputClass}
              />
            </div>
          </div>
        </section>

        <section>
          <h2 className="font-semibold text-accent mb-4">Colores del tema</h2>
          <p className="text-sm text-text-primary/50 mb-4">Valores en hexadecimal (ej: #3B82F6). Deja vacío para usar el valor por defecto.</p>
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <button
              type="button"
              onClick={handleResetColors}
              disabled={resetting || saving}
              className="text-sm font-medium text-text-primary/70 hover:text-brand border border-border hover:border-brand/50 px-4 py-2 rounded-xl transition-colors disabled:opacity-50"
            >
              {resetting ? "Restableciendo…" : "Restablecer colores"}
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {COLOR_KEYS.map(({ key, label }) => (
              <div key={key}>
                <label className="block text-sm font-medium text-text-primary/70 mb-1.5">{label}</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={form.colors[key] || DEFAULT_THEME_COLORS[key]}
                    onChange={updateColor(key)}
                    className="w-10 h-10 rounded-lg border border-border cursor-pointer bg-surface"
                  />
                  <input
                    type="text"
                    value={form.colors[key] || ""}
                    onChange={updateColor(key)}
                    placeholder={DEFAULT_THEME_COLORS[key]}
                    className={`${inputClass} flex-1 font-mono text-sm`}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="font-semibold text-accent mb-4">Banners</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-primary/70 mb-1.5">Banner horizontal (URL)</label>
              <input
                type="url"
                value={form.banner_horizontal_url}
                onChange={update("banner_horizontal_url")}
                placeholder="https://..."
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary/70 mb-1.5">Banner vertical (URL)</label>
              <input
                type="url"
                value={form.banner_vertical_url}
                onChange={update("banner_vertical_url")}
                placeholder="https://..."
                className={inputClass}
              />
            </div>
          </div>
        </section>

        <div className="pt-4">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 rounded-xl bg-brand text-white font-semibold hover:bg-brand-dark transition-colors disabled:opacity-50"
          >
            {saving ? "Guardando…" : "Guardar cambios"}
          </button>
        </div>
      </form>
    </div>
  );
}
