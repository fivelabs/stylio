import { useEffect, useRef, useState } from "react";
import { applyThemeColors, clearThemeColors, useTenant } from "@/app/providers/TenantProvider";
import { preferencesService } from "@/api/preferences.service";
import BillingSection from "@/features/dashboard/settings/components/BillingSection";
import BrandSection from "@/features/dashboard/settings/components/BrandSection";
import ColorsSection, { COLOR_KEYS, DEFAULT_THEME_COLORS } from "@/features/dashboard/settings/components/ColorsSection";
import BannersSection from "@/features/dashboard/settings/components/BannersSection";
import GoogleCalendarSection from "@/features/dashboard/settings/components/GoogleCalendarSection";

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

const INPUT_CLASS = "w-full px-4 py-2.5 rounded-xl bg-surface border border-border text-text-primary placeholder:text-text-primary/30 outline-none focus:border-brand focus:ring-2 focus:ring-brand/10";

export default function SettingsPage() {
  const { preferences, refreshPreferences } = useTenant();

  const [form, setForm] = useState(() => defaultForm(preferences));
  const [saving, setSaving] = useState(false);
  const [colorsReset, setColorsReset] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const savedRef = useRef(false);
  const originalColors = useRef(preferences?.colors ?? null);

  useEffect(() => {
    setForm(defaultForm(preferences));
    setColorsReset(false);
    originalColors.current = preferences?.colors ?? null;
  }, [preferences]);

  useEffect(() => {
    return () => {
      if (savedRef.current) return;
      if (originalColors.current) applyThemeColors(originalColors.current);
      else clearThemeColors();
    };
  }, []);

  const update = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    setError(null);
    setSuccess(false);
  };

  const updateColor = (key) => (e) => {
    const value = e.target.value;
    setForm((prev) => {
      const colors = { ...prev.colors, [key]: value };
      applyThemeColors(colors);
      return { ...prev, colors };
    });
    setError(null);
    setSuccess(false);
  };

  const handleResetColors = () => {
    applyThemeColors(DEFAULT_THEME_COLORS);
    setForm((prev) => ({ ...prev, colors: { ...defaultColors } }));
    setColorsReset(true);
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

    if (colorsReset) {
      payload.colors = null;
    } else {
      const colorsPayload = {};
      COLOR_KEYS.forEach(({ key }) => {
        const v = form.colors[key]?.trim();
        if (v && /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(v)) colorsPayload[key] = v;
      });
      if (Object.keys(colorsPayload).length > 0) payload.colors = colorsPayload;
    }

    try {
      await preferencesService.update(payload);
      savedRef.current = true;
      await refreshPreferences();
      setSuccess(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-8 max-w-5xl space-y-10">
      <div>
        <h1 className="font-heading text-2xl font-bold text-accent">Configuración del espacio</h1>
        <p className="text-text-primary/50 mt-1 text-sm">Personaliza tu espacio y administra tu suscripción.</p>
      </div>

      <BillingSection />

      {error && (
        <div className="px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
          {error}
        </div>
      )}
      {success && (
        <div className="px-4 py-3 rounded-xl bg-green-50 border border-green-200 text-green-700 text-sm">
          Preferencias guardadas correctamente.
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        <BrandSection form={form} update={update} inputClass={INPUT_CLASS} />
        <ColorsSection colors={form.colors} updateColor={updateColor} onReset={handleResetColors} saving={saving} inputClass={INPUT_CLASS} />
        <BannersSection form={form} update={update} inputClass={INPUT_CLASS} />

        <div className="pt-2">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 rounded-xl bg-brand text-white font-semibold hover:bg-brand-dark transition-colors disabled:opacity-50"
          >
            {saving ? "Guardando…" : "Guardar cambios"}
          </button>
        </div>
      </form>

      <GoogleCalendarSection />
    </div>
  );
}
