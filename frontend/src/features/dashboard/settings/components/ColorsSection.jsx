export const COLOR_KEYS = [
  { key: "brand", label: "Marca" },
  { key: "accent", label: "Acento" },
  { key: "brand-dark", label: "Marca oscuro" },
  { key: "text-primary", label: "Texto principal" },
  { key: "canvas", label: "Fondo" },
  { key: "surface", label: "Superficie" },
  { key: "border", label: "Borde" },
];

export const DEFAULT_THEME_COLORS = {
  brand: "#8D7B68",
  accent: "#1A1A1A",
  "brand-dark": "#6B5D4D",
  "text-primary": "#2D2D2D",
  canvas: "#FDFDFD",
  surface: "#F4F4F2",
  border: "#E5E5E3",
};

export default function ColorsSection({ colors, updateColor, onReset, saving, inputClass }) {
  return (
    <section>
      <h2 className="font-semibold text-accent mb-4">Colores del tema</h2>
      <p className="text-sm text-text-primary/50 mb-4">
        Valores en hexadecimal (ej: #3B82F6). Deja vacío para usar el valor por defecto.
      </p>
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <button
          type="button"
          onClick={onReset}
          disabled={saving}
          className="text-sm font-medium text-text-primary/70 hover:text-brand border border-border hover:border-brand/50 px-4 py-2 rounded-xl transition-colors disabled:opacity-50"
        >
          Restablecer colores
        </button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {COLOR_KEYS.map(({ key, label }) => (
          <div key={key}>
            <label className="block text-sm font-medium text-text-primary/70 mb-1.5">{label}</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={colors[key] || DEFAULT_THEME_COLORS[key]}
                onChange={updateColor(key)}
                className="w-10 h-10 rounded-lg border border-border cursor-pointer bg-surface shrink-0"
              />
              <input
                type="text"
                value={colors[key] || ""}
                onChange={updateColor(key)}
                placeholder={DEFAULT_THEME_COLORS[key]}
                className={`${inputClass} flex-1 min-w-0 font-mono text-sm`}
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
