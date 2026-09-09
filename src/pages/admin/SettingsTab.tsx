import { useEffect, useState, type FormEvent } from "react";
import { Plus, Trash2, Check, Save } from "lucide-react";
import { getSettings, updateSetting, type AppSettings } from "../../lib/api/settings";
import {
  listAllReasonOptions,
  addReasonOption,
  setReasonOptionActive,
  deleteReasonOption,
  type ReasonOption,
} from "../../lib/api/reasonOptions";
import { Button } from "../../components/ui/Button";

export function SettingsTab() {
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [savingSettings, setSavingSettings] = useState(false);
  const [savedNotice, setSavedNotice] = useState(false);

  const [options, setOptions] = useState<ReasonOption[]>([]);
  const [newLabel, setNewLabel] = useState("");
  const [loadingOptions, setLoadingOptions] = useState(true);

  useEffect(() => {
    getSettings().then(setSettings);
    refreshOptions();
  }, []);

  function refreshOptions() {
    setLoadingOptions(true);
    listAllReasonOptions()
      .then(setOptions)
      .finally(() => setLoadingOptions(false));
  }

  async function handleSaveSettings(e: FormEvent) {
    e.preventDefault();
    if (!settings) return;
    setSavingSettings(true);
    try {
      await updateSetting("upi_id", settings.upiId);
      await updateSetting("booking_fee_amount", String(settings.bookingFeeAmount));
      await updateSetting("payee_name", settings.payeeName);
      setSavedNotice(true);
      setTimeout(() => setSavedNotice(false), 2500);
    } finally {
      setSavingSettings(false);
    }
  }

  async function handleAddOption(e: FormEvent) {
    e.preventDefault();
    if (!newLabel.trim()) return;
    await addReasonOption(newLabel.trim());
    setNewLabel("");
    refreshOptions();
  }

  async function handleToggleActive(option: ReasonOption) {
    await setReasonOptionActive(option.id, !option.is_active);
    refreshOptions();
  }

  async function handleDelete(id: string) {
    await deleteReasonOption(id);
    refreshOptions();
  }

  return (
    <div className="max-w-2xl">
      <h1 className="font-serif text-2xl font-medium text-plum">Settings</h1>
      <p className="mt-1 text-sm text-ink/55">Booking fee, UPI details, and the reason checklist.</p>

      <form
        onSubmit={handleSaveSettings}
        className="mt-6 space-y-4 rounded-[1.75rem] bg-white p-5 shadow-card ring-1 ring-plum/5 sm:p-6"
      >
        <h2 className="font-serif text-lg font-medium text-plum">Booking Payment</h2>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ink/55">
              Booking fee (₹)
            </label>
            <input
              type="number"
              min={0}
              value={settings?.bookingFeeAmount ?? ""}
              onChange={(e) => setSettings((s) => (s ? { ...s, bookingFeeAmount: Number(e.target.value) } : s))}
              className="w-full rounded-xl border border-plum/12 bg-cream px-4 py-2.5 text-sm text-plum outline-none focus:border-rose-400"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ink/55">UPI ID</label>
            <input
              type="text"
              value={settings?.upiId ?? ""}
              onChange={(e) => setSettings((s) => (s ? { ...s, upiId: e.target.value } : s))}
              placeholder="clinic@upi"
              className="w-full rounded-xl border border-plum/12 bg-cream px-4 py-2.5 text-sm text-plum outline-none focus:border-rose-400"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ink/55">
              Payee name (shown on the QR screen)
            </label>
            <input
              type="text"
              value={settings?.payeeName ?? ""}
              onChange={(e) => setSettings((s) => (s ? { ...s, payeeName: e.target.value } : s))}
              className="w-full rounded-xl border border-plum/12 bg-cream px-4 py-2.5 text-sm text-plum outline-none focus:border-rose-400"
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button type="submit" size="sm" disabled={savingSettings} icon={<Save size={14} />} iconPosition="left">
            {savingSettings ? "Saving…" : "Save Changes"}
          </Button>
          {savedNotice && (
            <span className="flex items-center gap-1 text-xs font-medium text-sage-600">
              <Check size={13} /> Saved
            </span>
          )}
        </div>
      </form>

      <div className="mt-6 rounded-[1.75rem] bg-white p-5 shadow-card ring-1 ring-plum/5 sm:p-6">
        <h2 className="font-serif text-lg font-medium text-plum">Reason Checklist</h2>
        <p className="mt-1 text-sm text-ink/55">
          These show as checkboxes on the booking form. Turn one off to hide it without deleting its history.
        </p>

        <form onSubmit={handleAddOption} className="mt-4 flex gap-2">
          <input
            type="text"
            value={newLabel}
            onChange={(e) => setNewLabel(e.target.value)}
            placeholder="Add a new reason…"
            className="flex-1 rounded-xl border border-plum/12 bg-cream px-4 py-2.5 text-sm text-plum outline-none focus:border-rose-400"
          />
          <Button type="submit" size="sm" icon={<Plus size={14} />} iconPosition="left">
            Add
          </Button>
        </form>

        {loadingOptions ? (
          <p className="mt-4 text-sm text-ink/50">Loading…</p>
        ) : (
          <ul className="mt-4 divide-y divide-plum/8">
            {options.map((option) => (
              <li key={option.id} className="flex items-center justify-between py-3">
                <label className="flex items-center gap-2.5 text-sm text-plum">
                  <input
                    type="checkbox"
                    checked={option.is_active}
                    onChange={() => handleToggleActive(option)}
                    className="h-4 w-4 accent-rose-600"
                  />
                  <span className={option.is_active ? "" : "text-ink/35 line-through"}>{option.label}</span>
                </label>
                <button
                  onClick={() => handleDelete(option.id)}
                  aria-label={`Delete ${option.label}`}
                  className="flex h-8 w-8 items-center justify-center rounded-full text-ink/40 hover:bg-rose-50 hover:text-rose-600"
                >
                  <Trash2 size={14} />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
