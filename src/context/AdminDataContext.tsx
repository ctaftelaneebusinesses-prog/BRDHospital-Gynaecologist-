import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { listAppointments, type Appointment } from "../lib/api/appointments";

interface AdminDataContextValue {
  appointments: Appointment[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  pendingCount: number;
}

const AdminDataContext = createContext<AdminDataContextValue | null>(null);

export function AdminDataProvider({ children }: { children: ReactNode }) {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setAppointments(await listAppointments());
    } catch {
      setError("Couldn't load appointments. Make sure you're signed in and the backend is configured.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const pendingCount = useMemo(() => appointments.filter((a) => a.status === "pending").length, [appointments]);

  const value = useMemo(
    () => ({ appointments, loading, error, refresh, pendingCount }),
    [appointments, loading, error, refresh, pendingCount],
  );

  return <AdminDataContext.Provider value={value}>{children}</AdminDataContext.Provider>;
}

export function useAdminData() {
  const ctx = useContext(AdminDataContext);
  if (!ctx) throw new Error("useAdminData must be used within an AdminDataProvider");
  return ctx;
}
