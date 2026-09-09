import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useSession } from "../../lib/auth";

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { session, loading } = useSession();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-cream">
        <p className="text-sm text-ink/50">Loading…</p>
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/admin/login" replace />;
  }

  return <>{children}</>;
}
