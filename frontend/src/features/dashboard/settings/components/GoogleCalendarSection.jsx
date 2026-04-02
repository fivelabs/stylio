import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { googleCalendarService } from "@/api/integrations.service";

export default function GoogleCalendarSection() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [gcal, setGcal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState(false);
  const [msg, setMsg] = useState(null);

  useEffect(() => {
    googleCalendarService.getStatus()
      .then(setGcal)
      .catch(() => setGcal({ connected: false }))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const result = searchParams.get("google");
    if (!result) return;
    if (result === "connected") {
      setGcal((prev) => ({ ...prev, connected: true }));
      setMsg({ type: "success", text: "Google Calendar conectado correctamente." });
    } else if (result === "error") {
      setMsg({ type: "error", text: searchParams.get("msg") || "Error al conectar Google Calendar." });
    }
    setSearchParams({}, { replace: true });
  }, []);

  async function handleConnect() {
    setWorking(true);
    try {
      const { url } = await googleCalendarService.getAuthUrl();
      window.location.href = url;
    } catch (err) {
      setMsg({ type: "error", text: err.message });
      setWorking(false);
    }
  }

  async function handleDisconnect() {
    setWorking(true);
    try {
      await googleCalendarService.disconnect();
      setGcal({ connected: false });
      setMsg({ type: "success", text: "Google Calendar desconectado." });
    } catch (err) {
      setMsg({ type: "error", text: err.message });
    } finally {
      setWorking(false);
    }
  }

  return (
    <section className="pt-4 border-t border-border">
      <h2 className="font-semibold text-accent mb-1">Google Calendar</h2>
      <p className="text-sm text-text-primary/50 mb-5">
        Sincronización bidireccional: las citas de Stylio aparecerán en tu Google Calendar y viceversa.
      </p>

      {msg && (
        <div className={`mb-4 px-4 py-3 rounded-xl text-sm border ${msg.type === "success"
            ? "bg-green-50 border-green-200 text-green-700"
            : "bg-red-50 border-red-200 text-red-700"
          }`}>
          {msg.text}
        </div>
      )}

      {loading ? (
        <div className="h-10 w-48 rounded-xl bg-border/40 animate-pulse" />
      ) : gcal?.connected ? (
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-green-50 border border-green-200">
            <span className="w-2 h-2 rounded-full bg-green-500 shrink-0" />
            <span className="text-sm font-medium text-green-800">{gcal.google_email}</span>
          </div>
          <button
            type="button"
            onClick={handleDisconnect}
            disabled={working}
            className="px-4 py-2.5 rounded-xl text-sm font-medium text-red-600 border border-red-200 hover:bg-red-50 transition-colors disabled:opacity-50"
          >
            {working ? "Desconectando…" : "Desconectar"}
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={handleConnect}
          disabled={working}
          className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl border border-border hover:border-brand/50 hover:bg-brand/5 text-sm font-medium text-text-primary transition-colors disabled:opacity-50"
        >
          <svg viewBox="0 0 48 48" className="w-5 h-5 shrink-0" aria-hidden="true">
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.29-8.16 2.29-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
          </svg>
          {working ? "Redirigiendo…" : "Conectar Google Calendar"}
        </button>
      )}
    </section>
  );
}
