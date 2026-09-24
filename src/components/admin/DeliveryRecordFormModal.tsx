import { useState, type FormEvent, type ReactNode } from "react";
import { X } from "lucide-react";
import {
  BABY_GENDERS,
  BLOOD_GROUPS,
  DELIVERY_TYPES,
  INDIAN_STATES,
  createDeliveryRecord,
  updateDeliveryRecord,
  type BabyGender,
  type DeliveryRecord,
  type DeliveryRecordInput,
  type RecordStatus,
} from "../../lib/api/deliveryRecords";

interface DeliveryRecordFormModalProps {
  /** Omit to add a new record. */
  record?: DeliveryRecord;
  onClose: () => void;
  onSaved: () => void;
}

/** Every field is kept as a string while editing (that's what inputs give us) and converted on save. */
type FormState = Record<Exclude<keyof DeliveryRecordInput, "record_status">, string> & { record_status: RecordStatus };

const EMPTY_FORM: FormState = {
  record_status: "delivered",
  mother_name: "",
  mother_age: "",
  mother_occupation: "",
  mother_blood_group: "",
  father_name: "",
  father_occupation: "",
  contact_number: "",
  alternate_contact_number: "",
  address: "",
  district: "",
  state: "Telangana",
  pincode: "",
  expected_delivery_date: "",
  delivery_date: "",
  delivery_type: "",
  gestation_weeks: "",
  baby_birth_date: "",
  baby_birth_time: "",
  baby_weight_kg: "",
  baby_gender: "",
  baby_blood_group: "",
  notes: "",
};

function toFormState(record: DeliveryRecord): FormState {
  const form = { ...EMPTY_FORM, record_status: record.record_status };
  for (const key of Object.keys(EMPTY_FORM) as (keyof FormState)[]) {
    if (key === "record_status") continue;
    const value = record[key];
    form[key] = value === null || value === undefined ? "" : String(value);
  }
  return form;
}

const ALWAYS_REQUIRED: (keyof FormState)[] = [
  "mother_name",
  "mother_age",
  "mother_occupation",
  "mother_blood_group",
  "father_name",
  "father_occupation",
  "contact_number",
  "address",
  "district",
  "state",
];

const REQUIRED_WHEN_DELIVERED: (keyof FormState)[] = [
  "delivery_date",
  "delivery_type",
  "baby_birth_date",
  "baby_weight_kg",
  "baby_gender",
  "baby_blood_group",
];

function validate(form: FormState): Partial<Record<keyof FormState, string>> {
  const errors: Partial<Record<keyof FormState, string>> = {};
  const required = form.record_status === "delivered" ? [...ALWAYS_REQUIRED, ...REQUIRED_WHEN_DELIVERED] : ALWAYS_REQUIRED;
  for (const key of required) {
    if (!form[key].trim()) errors[key] = "Required";
  }

  const age = Number(form.mother_age);
  if (form.mother_age && (!Number.isInteger(age) || age < 10 || age > 70)) errors.mother_age = "Enter an age between 10 and 70";

  const phoneDigits = form.contact_number.replace(/\D/g, "");
  if (form.contact_number && (phoneDigits.length < 10 || phoneDigits.length > 12)) {
    errors.contact_number = "Enter a valid 10-digit mobile number";
  }

  const weight = Number(form.baby_weight_kg);
  if (form.baby_weight_kg && (!(weight > 0) || weight >= 10)) errors.baby_weight_kg = "Enter weight in kg, e.g. 3.2";

  const weeks = Number(form.gestation_weeks);
  if (form.gestation_weeks && (!Number.isInteger(weeks) || weeks < 20 || weeks > 45)) {
    errors.gestation_weeks = "Between 20 and 45";
  }
  return errors;
}

function toInput(form: FormState): DeliveryRecordInput {
  const text = (v: string) => v.trim() || null;
  const num = (v: string) => (v.trim() ? Number(v) : null);
  const delivered = form.record_status === "delivered";
  // Delivery/baby fields only make sense once delivered — clear them for expecting mothers so
  // switching a record back to "expecting" never leaves stale baby details behind.
  const ifDelivered = <T,>(v: T) => (delivered ? v : null);

  return {
    record_status: form.record_status,
    mother_name: form.mother_name.trim(),
    mother_age: num(form.mother_age),
    mother_occupation: text(form.mother_occupation),
    mother_blood_group: text(form.mother_blood_group),
    father_name: form.father_name.trim(),
    father_occupation: text(form.father_occupation),
    contact_number: form.contact_number.trim(),
    alternate_contact_number: text(form.alternate_contact_number),
    address: form.address.trim(),
    district: form.district.trim(),
    state: form.state.trim(),
    pincode: text(form.pincode),
    expected_delivery_date: text(form.expected_delivery_date),
    delivery_date: ifDelivered(text(form.delivery_date)),
    delivery_type: ifDelivered(text(form.delivery_type)),
    gestation_weeks: num(form.gestation_weeks),
    baby_birth_date: ifDelivered(text(form.baby_birth_date)),
    baby_birth_time: ifDelivered(text(form.baby_birth_time)),
    baby_weight_kg: ifDelivered(num(form.baby_weight_kg)),
    baby_gender: ifDelivered(text(form.baby_gender) as BabyGender | null),
    baby_blood_group: ifDelivered(text(form.baby_blood_group)),
    notes: text(form.notes),
  };
}

const INPUT_CLASS =
  "w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-plum outline-none focus:border-rose-400";

function Field({ label, required, error, children }: { label: string; required?: boolean; error?: string; children: ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ink/55">
        {label}
        {required && <span className="text-rose-500"> *</span>}
      </label>
      {children}
      {error && <p className="mt-1 text-xs text-rose-600">{error}</p>}
    </div>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <fieldset className="rounded-2xl bg-white/60 p-4 ring-1 ring-plum/8">
      <legend className="px-1 font-serif text-base font-medium text-plum">{title}</legend>
      <div className="grid gap-4 sm:grid-cols-2">{children}</div>
    </fieldset>
  );
}

export function DeliveryRecordFormModal({ record, onClose, onSaved }: DeliveryRecordFormModalProps) {
  const [form, setForm] = useState<FormState>(record ? toFormState(record) : EMPTY_FORM);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const delivered = form.record_status === "delivered";

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => {
      const next = { ...prev, [key]: value };
      // The baby is almost always born on the delivery date — pre-fill it, but let staff change it.
      if (key === "delivery_date" && (!prev.baby_birth_date || prev.baby_birth_date === prev.delivery_date)) {
        next.baby_birth_date = value as string;
      }
      return next;
    });
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  function inputProps(key: Exclude<keyof FormState, "record_status">) {
    return {
      value: form[key],
      onChange: (e: { target: { value: string } }) => set(key, e.target.value),
      className: `${INPUT_CLASS} ${errors[key] ? "border-rose-400" : "border-plum/12"}`,
    };
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const found = validate(form);
    setErrors(found);
    if (Object.keys(found).length > 0) {
      setSaveError("Please fill in the highlighted fields.");
      return;
    }
    setSaving(true);
    setSaveError(null);
    try {
      const input = toInput(form);
      if (record) await updateDeliveryRecord(record.id, input);
      else await createDeliveryRecord(input);
      onSaved();
    } catch {
      setSaveError("Couldn't save the record. Please check your connection and try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-[70] flex items-end justify-center bg-plum/50 p-0 backdrop-blur-sm sm:items-center sm:p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <form
        onSubmit={handleSubmit}
        noValidate
        className="flex max-h-[92vh] w-full max-w-3xl flex-col rounded-t-[2rem] bg-cream shadow-2xl sm:rounded-[2rem]"
      >
        <div className="flex items-center justify-between border-b border-plum/8 px-6 py-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-rose-500">Patient Record</p>
            <h2 className="mt-0.5 font-serif text-xl font-medium text-plum">
              {record ? `Edit — ${record.mother_name}` : "Add New Patient"}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-9 w-9 items-center justify-center rounded-full text-plum/60 hover:bg-plum/5 hover:text-plum"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 space-y-5 overflow-y-auto px-6 py-5">
          <div className="flex gap-2">
            {(["delivered", "expecting"] as RecordStatus[]).map((status) => (
              <button
                key={status}
                type="button"
                onClick={() => set("record_status", status)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                  form.record_status === status ? "bg-plum text-cream" : "bg-white text-ink/60 ring-1 ring-plum/10 hover:bg-plum/5"
                }`}
              >
                {status === "delivered" ? "Delivered" : "Pregnant (Expecting)"}
              </button>
            ))}
          </div>

          <Section title="Mother">
            <Field label="Mother's Name" required error={errors.mother_name}>
              <input type="text" {...inputProps("mother_name")} />
            </Field>
            <Field label="Mother's Age" required error={errors.mother_age}>
              <input type="number" min={10} max={70} {...inputProps("mother_age")} />
            </Field>
            <Field label="Mother's Occupation" required error={errors.mother_occupation}>
              <input type="text" placeholder="e.g. Homemaker, Teacher" {...inputProps("mother_occupation")} />
            </Field>
            <Field label="Mother's Blood Group" required error={errors.mother_blood_group}>
              <select {...inputProps("mother_blood_group")}>
                <option value="">Select…</option>
                {BLOOD_GROUPS.map((g) => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </Field>
          </Section>

          <Section title="Father">
            <Field label="Father's Name" required error={errors.father_name}>
              <input type="text" {...inputProps("father_name")} />
            </Field>
            <Field label="Father's Occupation" required error={errors.father_occupation}>
              <input type="text" placeholder="e.g. Farmer, Engineer" {...inputProps("father_occupation")} />
            </Field>
          </Section>

          <Section title="Contact & Address">
            <Field label="Contact Number" required error={errors.contact_number}>
              <input type="tel" placeholder="10-digit mobile number" {...inputProps("contact_number")} />
            </Field>
            <Field label="Alternate Number" error={errors.alternate_contact_number}>
              <input type="tel" {...inputProps("alternate_contact_number")} />
            </Field>
            <div className="sm:col-span-2">
              <Field label="Address" required error={errors.address}>
                <textarea rows={2} placeholder="House no., street, village / town" {...inputProps("address")} />
              </Field>
            </div>
            <Field label="District" required error={errors.district}>
              <input type="text" {...inputProps("district")} />
            </Field>
            <Field label="State" required error={errors.state}>
              <select {...inputProps("state")}>
                <option value="">Select…</option>
                {INDIAN_STATES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </Field>
            <Field label="Pincode" error={errors.pincode}>
              <input type="text" inputMode="numeric" maxLength={6} {...inputProps("pincode")} />
            </Field>
          </Section>

          <Section title={delivered ? "Delivery" : "Pregnancy"}>
            {!delivered && (
              <Field label="Expected Delivery Date" error={errors.expected_delivery_date}>
                <input type="date" {...inputProps("expected_delivery_date")} />
              </Field>
            )}
            {delivered && (
              <>
                <Field label="Delivery Date" required error={errors.delivery_date}>
                  <input type="date" {...inputProps("delivery_date")} />
                </Field>
                <Field label="Type of Delivery" required error={errors.delivery_type}>
                  <select {...inputProps("delivery_type")}>
                    <option value="">Select…</option>
                    {DELIVERY_TYPES.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </Field>
              </>
            )}
            <Field label="Gestation (weeks)" error={errors.gestation_weeks}>
              <input type="number" min={20} max={45} placeholder="e.g. 39" {...inputProps("gestation_weeks")} />
            </Field>
          </Section>

          {delivered && (
            <Section title="Baby">
              <Field label="Baby's Date of Birth" required error={errors.baby_birth_date}>
                <input type="date" {...inputProps("baby_birth_date")} />
              </Field>
              <Field label="Time of Birth" error={errors.baby_birth_time}>
                <input type="time" {...inputProps("baby_birth_time")} />
              </Field>
              <Field label="Baby's Weight (kg)" required error={errors.baby_weight_kg}>
                <input type="number" step="0.01" min={0} placeholder="e.g. 3.25" {...inputProps("baby_weight_kg")} />
              </Field>
              <Field label="Gender" required error={errors.baby_gender}>
                <select {...inputProps("baby_gender")}>
                  <option value="">Select…</option>
                  {BABY_GENDERS.map((g) => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
              </Field>
              <Field label="Baby's Blood Group" required error={errors.baby_blood_group}>
                <select {...inputProps("baby_blood_group")}>
                  <option value="">Select…</option>
                  {BLOOD_GROUPS.map((g) => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
              </Field>
            </Section>
          )}

          <Field label="Notes" error={errors.notes}>
            <textarea rows={3} placeholder="Any complications, remarks, follow-up advice…" {...inputProps("notes")} />
          </Field>
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-plum/8 px-6 py-4">
          <p className="text-xs text-rose-600">{saveError}</p>
          <div className="flex gap-2">
            <button type="button" onClick={onClose} className="rounded-full px-4 py-2.5 text-sm text-ink/60 hover:bg-plum/5">
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded-full bg-plum px-5 py-2.5 text-sm font-semibold text-cream hover:bg-plum/90 disabled:opacity-50"
            >
              {saving ? "Saving…" : record ? "Save Changes" : "Add Patient"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
