export default function BrandSection({ form, update, inputClass }) {
  return (
    <section>
      <h2 className="font-semibold text-accent mb-4">Marca</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
  );
}
