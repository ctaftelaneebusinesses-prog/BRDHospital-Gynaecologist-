import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Baby, Download, Pencil, Plus, RefreshCw, Search, Trash2, X } from "lucide-react";
import {
  deleteDeliveryRecord,
  listDeliveryRecords,
  type DeliveryRecord,
  type RecordStatus,
} from "../../lib/api/deliveryRecords";
import { DeliveryRecordFormModal } from "../../components/admin/DeliveryRecordFormModal";
import { downloadCsv } from "../../lib/csvExport";

type Filter = "all" | RecordStatus;

const FILTERS: { value: Filter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "delivered", label: "Delivered" },
  { value: "expecting", label: "Pregnant (Expecting)" },
];

const DATE_FORMAT = new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short", year: "numeric" });

function formatDate(iso: string | null): string {
  return iso ? DATE_FORMAT.format(new Date(iso + "T00:00:00")) : "—";
}

function Row({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2.5">
      <span className="text-xs font-semibold uppercase tracking-wide text-ink/40">{label}</span>
      <span className="text-right text-sm font-medium text-plum">{value ?? "—"}</span>
    </div>
  );
}

function RecordDetailModal({ record: r, onClose, onEdit }: { record: DeliveryRecord; onClose: () => void; onEdit: () => void }) {
  const delivered = r.record_status === "delivered";
  return (
    <div
      className="fixed inset-0 z-[70] flex items-end justify-center bg-plum/50 p-0 backdrop-blur-sm sm:items-center sm:p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-t-[2rem] bg-cream shadow-2xl sm:rounded-[2rem]">
        <div className="flex items-center justify-between border-b border-plum/8 px-6 py-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-rose-500">
              {delivered ? "Delivered" : "Pregnant (Expecting)"}
            </p>
            <h2 className="mt-0.5 font-serif text-xl font-medium text-plum">{r.mother_name}</h2>
          </div>
          <div className="flex gap-1">
            <button
              onClick={onEdit}
              aria-label="Edit"
              className="flex h-9 w-9 items-center justify-center rounded-full text-plum/60 hover:bg-plum/5 hover:text-plum"
            >
              <Pencil size={16} />
            </button>
            <button
              onClick={onClose}
              aria-label="Close"
              className="flex h-9 w-9 items-center justify-center rounded-full text-plum/60 hover:bg-plum/5 hover:text-plum"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="divide-y divide-plum/8 px-6 py-4">
          <Row label="Mother's Name" value={r.mother_name} />
          <Row label="Mother's Age" value={r.mother_age} />
          <Row label="Mother's Occupation" value={r.mother_occupation} />
          <Row label="Mother's Blood Group" value={r.mother_blood_group} />
          <Row label="Father's Name" value={r.father_name} />
          <Row label="Father's Occupation" value={r.father_occupation} />
          <Row label="Contact Number" value={r.contact_number} />
          {r.alternate_contact_number && <Row label="Alternate Number" value={r.alternate_contact_number} />}
          <Row label="Address" value={r.address} />
          <Row label="District" value={r.district} />
          <Row label="State" value={r.state} />
          {r.pincode && <Row label="Pincode" value={r.pincode} />}
          {!delivered && <Row label="Expected Delivery" value={formatDate(r.expected_delivery_date)} />}
          {r.gestation_weeks != null && <Row label="Gestation" value={`${r.gestation_weeks} weeks`} />}
          {delivered && (
            <>
              <Row label="Delivery Date" value={formatDate(r.delivery_date)} />
              <Row label="Type of Delivery" value={r.delivery_type} />
              <Row label="Baby's Date of Birth" value={formatDate(r.baby_birth_date)} />
              {r.baby_birth_time && <Row label="Time of Birth" value={r.baby_birth_time} />}
              <Row label="Baby's Weight" value={r.baby_weight_kg != null ? `${r.baby_weight_kg} kg` : "—"} />
              <Row label="Baby's Gender" value={r.baby_gender} />
              <Row label="Baby's Blood Group" value={r.baby_blood_group} />
            </>
          )}
          {r.notes && <Row label="Notes" value={<span className="whitespace-pre-line">{r.notes}</span>} />}
        </div>
      </div>
    </div>
  );
}

export function PatientRecordsTab() {
  const [records, setRecords] = useState<DeliveryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>("all");
  const [search, setSearch] = useState("");
  const [viewing, setViewing] = useState<DeliveryRecord | null>(null);
  /** undefined = form closed, null = adding a new record, otherwise the record being edited. */
  const [editing, setEditing] = useState<DeliveryRecord | null | undefined>(undefined);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function refresh() {
    setLoading(true);
    setError(null);
    try {
      setRecords(await listDeliveryRecords());
    } catch {
      setError("Couldn't load patient records. Make sure you're signed in and the backend is configured.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  const counts = useMemo(
    () => ({
      all: records.length,
      delivered: records.filter((r) => r.record_status === "delivered").length,
      expecting: records.filter((r) => r.record_status === "expecting").length,
    }),
    [records],
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return records.filter((r) => {
      if (filter !== "all" && r.record_status !== filter) return false;
      if (!q) return true;
      return [r.mother_name, r.father_name, r.contact_number, r.district, r.state].some((v) =>
        v?.toLowerCase().includes(q),
      );
    });
  }, [records, filter, search]);

  async function handleDelete(record: DeliveryRecord) {
    if (!window.confirm(`Delete the record for ${record.mother_name}? This can't be undone.`)) return;
    setDeletingId(record.id);
    try {
      await deleteDeliveryRecord(record.id);
      await refresh();
    } catch {
      setError("Couldn't delete the record. Please try again.");
    } finally {
      setDeletingId(null);
    }
  }

  function handleExport() {
    downloadCsv(
      `patient-records-${new Date().toISOString().split("T")[0]}.csv`,
      [
        "Status", "Mother Name", "Mother Age", "Mother Occupation", "Mother Blood Group", "Father Name",
        "Father Occupation", "Contact Number", "Alternate Number", "Address", "District", "State", "Pincode",
        "Expected Delivery Date", "Delivery Date", "Delivery Type", "Gestation (weeks)", "Baby Date of Birth",
        "Baby Time of Birth", "Baby Weight (kg)", "Baby Gender", "Baby Blood Group", "Notes",
      ],
      filtered.map((r) => [
        r.record_status === "delivered" ? "Delivered" : "Expecting", r.mother_name, r.mother_age,
        r.mother_occupation, r.mother_blood_group, r.father_name, r.father_occupation, r.contact_number,
        r.alternate_contact_number, r.address, r.district, r.state, r.pincode, r.expected_delivery_date,
        r.delivery_date, r.delivery_type, r.gestation_weeks, r.baby_birth_date, r.baby_birth_time,
        r.baby_weight_kg, r.baby_gender, r.baby_blood_group, r.notes,
      ]),
    );
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-serif text-2xl font-medium text-plum">Patient Records</h1>
          <p className="mt-1 text-sm text-ink/55">Pregnancy and delivery details of mothers and their babies.</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setEditing(null)}
            className="flex items-center gap-1.5 rounded-full bg-rose-600 px-4 py-2 text-sm font-medium text-cream hover:bg-rose-700"
          >
            <Plus size={14} /> Add Patient
          </button>
          <button
            onClick={handleExport}
            disabled={filtered.length === 0}
            className="flex items-center gap-1.5 rounded-full bg-plum px-4 py-2 text-sm font-medium text-cream hover:bg-plum/90 disabled:opacity-50"
          >
            <Download size={14} /> Download Excel
          </button>
          <button
            onClick={refresh}
            className="flex items-center gap-1.5 rounded-full px-3 py-2 text-sm text-ink/60 hover:bg-plum/5"
          >
            <RefreshCw size={14} /> Refresh
          </button>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        {FILTERS.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => setFilter(value)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              filter === value ? "bg-plum text-cream" : "bg-white text-ink/60 ring-1 ring-plum/10 hover:bg-plum/5"
            }`}
          >
            {label} ({counts[value]})
          </button>
        ))}
      </div>

      <div className="relative mt-4 max-w-md">
        <Search size={15} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink/35" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by mother/father name, phone, district…"
          className="w-full rounded-full border border-plum/12 bg-white py-2.5 pl-9 pr-4 text-sm text-ink outline-none focus:border-rose-400"
        />
      </div>

      {error && <p className="mt-4 rounded-xl bg-rose-50 p-3 text-sm text-rose-600">{error}</p>}

      {loading ? (
        <p className="mt-6 text-sm text-ink/50">Loading patient records…</p>
      ) : filtered.length === 0 ? (
        <div className="mt-6 flex flex-col items-center gap-3 rounded-[1.75rem] bg-white py-16 text-center shadow-card ring-1 ring-plum/5">
          <Baby className="text-ink/30" size={32} />
          <p className="text-sm text-ink/50">No patient records yet. Click “Add Patient” to add one.</p>
        </div>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-[1.75rem] bg-white shadow-card ring-1 ring-plum/5">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="border-b border-plum/8 bg-plum/[0.03] text-xs uppercase tracking-wide text-ink/45">
              <tr>
                <th className="px-5 py-3 font-medium">Mother / Father</th>
                <th className="px-5 py-3 font-medium">Contact</th>
                <th className="px-5 py-3 font-medium">Place</th>
                <th className="px-5 py-3 font-medium">Delivery</th>
                <th className="px-5 py-3 font-medium">Baby</th>
                <th className="px-5 py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-plum/8">
              {filtered.map((r) => (
                <tr key={r.id} onClick={() => setViewing(r)} className="cursor-pointer hover:bg-plum/[0.02]">
                  <td className="px-5 py-3.5">
                    <p className="font-medium text-plum">
                      {r.mother_name}
                      {r.mother_age != null && <span className="font-normal text-ink/50"> · {r.mother_age} yrs</span>}
                    </p>
                    <p className="text-xs text-ink/50">W/o {r.father_name}</p>
                  </td>
                  <td className="px-5 py-3.5 text-ink/70">{r.contact_number}</td>
                  <td className="px-5 py-3.5 text-ink/70">
                    {r.district}
                    <p className="text-xs text-ink/45">{r.state}</p>
                  </td>
                  <td className="px-5 py-3.5">
                    {r.record_status === "delivered" ? (
                      <>
                        <p className="text-ink/70">{formatDate(r.delivery_date)}</p>
                        <p className="text-xs text-ink/45">{r.delivery_type}</p>
                      </>
                    ) : (
                      <>
                        <span className="rounded-full bg-gold-300/40 px-2.5 py-0.5 text-xs font-medium text-[#8a6a1f]">
                          Expecting
                        </span>
                        {r.expected_delivery_date && (
                          <p className="mt-1 text-xs text-ink/45">Due {formatDate(r.expected_delivery_date)}</p>
                        )}
                      </>
                    )}
                  </td>
                  <td className="px-5 py-3.5 text-ink/70">
                    {r.record_status === "delivered" ? (
                      <>
                        {r.baby_gender} · {r.baby_weight_kg != null ? `${r.baby_weight_kg} kg` : "—"}
                        <p className="text-xs text-ink/45">Blood group: {r.baby_blood_group ?? "—"}</p>
                      </>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => setEditing(r)}
                        aria-label="Edit"
                        className="flex h-8 w-8 items-center justify-center rounded-full text-ink/40 hover:bg-plum/5 hover:text-plum"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(r)}
                        disabled={deletingId !== null}
                        aria-label="Delete"
                        className="flex h-8 w-8 items-center justify-center rounded-full text-ink/40 hover:bg-rose-50 hover:text-rose-600 disabled:opacity-50"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {viewing && (
        <RecordDetailModal
          record={viewing}
          onClose={() => setViewing(null)}
          onEdit={() => {
            setEditing(viewing);
            setViewing(null);
          }}
        />
      )}

      {editing !== undefined && (
        <DeliveryRecordFormModal
          record={editing ?? undefined}
          onClose={() => setEditing(undefined)}
          onSaved={() => {
            setEditing(undefined);
            refresh();
          }}
        />
      )}
    </div>
  );
}
