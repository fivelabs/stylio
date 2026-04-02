export default function BannersSection({ form, update, inputClass }) {
  return (
    <section>
      <h2 className="font-semibold text-accent mb-4">Banners</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
  );
}
