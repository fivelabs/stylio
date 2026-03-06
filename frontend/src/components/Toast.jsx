import { createContext, useCallback, useContext, useState } from "react";
import { X, AlertCircle, CheckCircle } from "lucide-react";

const ToastContext = createContext(null);

const DURATION = 4000;

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const add = useCallback((type, message) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => dismiss(id), DURATION);
    return id;
  }, [dismiss]);

  const toast = {
    error: (msg) => add("error", msg),
    success: (msg) => add("success", msg),
    dismiss,
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="fixed bottom-6 right-6 z-[9998] flex flex-col gap-3 pointer-events-none">
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} onDismiss={() => dismiss(t.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function ToastItem({ toast, onDismiss }) {
  const isError = toast.type === "error";

  return (
    <div
      className={[
        "pointer-events-auto flex items-start gap-3 px-4 py-3.5 rounded-xl shadow-lg border max-w-sm",
        "animate-[slideIn_0.25s_ease-out]",
        isError
          ? "bg-red-50 border-red-200 text-red-800"
          : "bg-green-50 border-green-200 text-green-800",
      ].join(" ")}
    >
      {isError ? (
        <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
      ) : (
        <CheckCircle className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
      )}
      <p className="text-sm font-medium flex-1">{toast.message}</p>
      <button
        onClick={onDismiss}
        className="shrink-0 text-current opacity-40 hover:opacity-70 transition-opacity"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
