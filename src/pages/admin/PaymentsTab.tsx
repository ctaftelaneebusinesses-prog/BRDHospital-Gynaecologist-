import { useMemo } from "react";
import { Download, Wallet } from "lucide-react";
import { useAdminData } from "../../context/AdminDataContext";
import { downloadCsv } from "../../lib/csvExport";

const DATETIME_FORMAT = new Intl.DateTimeFormat("en-US", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

const PAYMENT_STYLES = {
  pending: "bg-gold-300/40 text-[#8a6a1f]",
  paid: "bg-sage-100 text-sage-600",
  failed: "bg-rose-100 text-rose-600",
} as const;

export function PaymentsTab() {
  const { appointments, loading } = useAdminData();

  const rows = useMemo(
    () => [...appointments].sort((a, b) => b.created_at.localeCompare(a.created_at)),
    [appointments],
  );

  const totals = useMemo(() => {
    const paid = appointments.filter((a) => a.payment_status === "paid");
    return {
      revenue: paid.reduce((sum, a) => sum + (a.payment_amount ?? 0), 0),
      paidCount: paid.length,
      pendingCount: appointments.filter((a) => a.payment_status === "pending").length,
      failedCount: appointments.filter((a) => a.payment_status === "failed").length,
    };
  }, [appointments]);

  function handleExport() {
    downloadCsv(
      `payments-${new Date().toISOString().split("T")[0]}.csv`,
      ["Patient", "Amount", "Payment Status", "Booked At", "Payment Confirmed At"],
      rows.map((a) => [
        a.full_name,
        a.payment_amount ?? "",
        a.payment_status,
        a.created_at,
        a.payment_confirmed_at ?? "",
      ]),
    );
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-serif text-2xl font-medium text-plum">Payment History</h1>
          <p className="mt-1 text-sm text-ink/55">
            ₹{totals.revenue} collected · {totals.paidCount} paid · {totals.pendingCount} pending ·{" "}
            {totals.failedCount} failed
          </p>
        </div>
        <button
          onClick={handleExport}
          className="flex items-center gap-1.5 rounded-full bg-plum px-4 py-2 text-sm font-medium text-cream hover:bg-plum/90"
        >
          <Download size={14} /> Download Excel
        </button>
      </div>

      {loading ? (
        <p className="mt-6 text-sm text-ink/50">Loading…</p>
      ) : rows.length === 0 ? (
        <div className="mt-6 flex flex-col items-center gap-3 rounded-[1.75rem] bg-white py-16 text-center shadow-card ring-1 ring-plum/5">
          <Wallet className="text-ink/30" size={32} />
          <p className="text-sm text-ink/50">No payments yet.</p>
        </div>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-[1.75rem] bg-white shadow-card ring-1 ring-plum/5">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="border-b border-plum/8 bg-plum/[0.03] text-xs uppercase tracking-wide text-ink/45">
              <tr>
                <th className="px-5 py-3 font-medium">Patient</th>
                <th className="px-5 py-3 font-medium">Amount</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium">Booked At</th>
                <th className="px-5 py-3 font-medium">Payment Confirmed At</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-plum/8">
              {rows.map((a) => (
                <tr key={a.id}>
                  <td className="px-5 py-4 font-medium text-plum">{a.full_name}</td>
                  <td className="px-5 py-4 text-ink/70">{a.payment_amount != null ? `₹${a.payment_amount}` : "—"}</td>
                  <td className="px-5 py-4">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-medium capitalize ${PAYMENT_STYLES[a.payment_status]}`}>
                      {a.payment_status}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-xs text-ink/50">{DATETIME_FORMAT.format(new Date(a.created_at))}</td>
                  <td className="px-5 py-4 text-xs text-ink/50">
                    {a.payment_confirmed_at ? DATETIME_FORMAT.format(new Date(a.payment_confirmed_at)) : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
