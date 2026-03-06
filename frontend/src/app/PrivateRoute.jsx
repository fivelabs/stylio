import { Navigate } from "react-router-dom";
import { useAuth } from "@/app/AuthProvider";

export default function PrivateRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-canvas">
        <span className="w-8 h-8 border-3 border-brand/30 border-t-brand rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  return children;
}
