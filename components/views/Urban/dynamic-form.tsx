'use client';

import { useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import { Paperclip, X } from 'lucide-react';

import { C, S, alpha } from '@/components/ui/tokens';
import { Field, Chip } from '@/components/ui/kit';

/**
 * فرمی که شهرداری خودش تعریف کرده.
 *
 * Every other form in this app is JSX: a field exists because somebody wrote
 * an `<input>` for it. This one is drawn from a definition the municipality
 * built in its own panel, because «درخواست پروانهٔ ساخت» is not one form — it
 * is one form per city, and the platform cannot ship all of them.
 *
 * The definition this renders is the same object the server validates against.
 * That is the entire point: a required field is drawn as required *and* refused
 * when empty, from one source. What this file must never do is decide
 * anything on its own — it draws what it is given and sends back what was
 * typed. The server is what says no.
 *
 * Conditional fields (`showIf`) are evaluated here so the citizen never sees a
 * question that does not apply, and evaluated again on the server so a hidden
 * one cannot be required — the two agree because they run the same rule from
 * `shared/Utils/formSchema.js`.
 */

// Leaflet touches `window` at import time, so it can never be server-rendered.
const MapPicker = dynamic(() => import('@/components/views/NewRequest/steps/map-component'), {
  ssr: false,
  loading: () => <div style={{ height: 240, borderRadius: S.r3, background: C.surface2 }} />,
});

/** Where the picker opens before anything is chosen — the middle of همدان استان. */
const DEFAULT_CENTER = { lat: 34.7992, lng: 48.5146 };

export interface FormField {
  key: string;
  label: string;
  type: string;
  required?: boolean;
  hint?: string;
  placeholder?: string;
  options?: { value: string; label: string }[];
  min?: number;
  max?: number;
  minLength?: number;
  maxLength?: number;
  maxFiles?: number;
  showIf?: { field: string; equals?: any };
}

export interface FormSection {
  title: string;
  description?: string;
  fields: FormField[];
}

export interface FormDefinition {
  sections: FormSection[];
}

export type FormValues = Record<string, any>;
export type FormFiles = Record<string, File[]>;

/** The same rule the server runs — see `shared/Utils/formSchema.js#isVisible`. */
export function isVisible(field: FormField, values: FormValues): boolean {
  const rule = field?.showIf;
  if (!rule || !rule.field) return true;
  const actual = values?.[rule.field];
  if (Array.isArray(rule.equals)) return rule.equals.includes(actual);
  if (rule.equals === undefined) {
    return !(actual === undefined || actual === null || actual === '' || (Array.isArray(actual) && !actual.length));
  }
  return String(actual ?? '') === String(rule.equals);
}

/** Fields actually being asked, given what has been answered so far. */
export function visibleFields(form: FormDefinition | null, values: FormValues): FormField[] {
  return (form?.sections || [])
    .flatMap((s) => s.fields || [])
    .filter((f) => f.type !== 'note' && isVisible(f, values));
}

/**
 * A first pass in the browser, so somebody is not sent to the server to be told
 * a box is empty. Deliberately thinner than the server's: this catches
 * «you left this blank», the server catches everything, and if the two ever
 * disagree the server is right.
 */
export function findMissing(form: FormDefinition | null, values: FormValues, files: FormFiles): string | null {
  for (const field of visibleFields(form, values)) {
    if (!field.required) continue;
    const isFile = field.type === 'file' || field.type === 'files';
    const value = values[field.key];
    const empty = isFile
      ? !(files[field.key] || []).length
      : value === undefined || value === null || value === '' || (Array.isArray(value) && !value.length);
    if (empty) return `«${field.label}» را کامل کنید.`;
  }
  return null;
}

/* ── one field ───────────────────────────────────────────────────────────── */

function FieldInput({
  field,
  value,
  files,
  onChange,
  onFiles,
}: {
  field: FormField;
  value: any;
  files: File[];
  onChange: (v: any) => void;
  onFiles: (f: File[]) => void;
}) {
  const common = {
    className: 'pm-field',
    placeholder: field.placeholder || '',
    style: { width: '100%' },
  };

  switch (field.type) {
    case 'textarea':
      return (
        <textarea
          {...common}
          rows={4}
          maxLength={field.maxLength || 2000}
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value)}
        />
      );

    case 'number':
    case 'area':
    case 'money':
      return (
        <input
          {...common}
          // `inputMode` rather than `type="number"`: a numeric keypad without
          // the spinner, and without a browser silently blanking a value it
          // dislikes while the citizen is still typing it.
          inputMode="numeric"
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value)}
        />
      );

    case 'phone':
    case 'nationalId':
    case 'postalCode':
      return (
        <input
          {...common}
          inputMode="numeric"
          // Latin digits left-to-right, even inside an RTL page.
          dir="ltr"
          style={{ ...common.style, textAlign: 'right' as const }}
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value)}
        />
      );

    case 'select':
      return (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: S.s2 }}>
          {(field.options || []).map((option) => (
            <Chip
              key={option.value}
              active={String(value ?? '') === String(option.value)}
              onClick={() => onChange(option.value)}
            >
              {option.label}
            </Chip>
          ))}
        </div>
      );

    case 'multiselect': {
      const chosen: string[] = Array.isArray(value) ? value : [];
      return (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: S.s2 }}>
          {(field.options || []).map((option) => {
            const on = chosen.includes(option.value);
            return (
              <Chip
                key={option.value}
                active={on}
                onClick={() =>
                  onChange(on ? chosen.filter((v) => v !== option.value) : [...chosen, option.value])
                }
              >
                {option.label}
              </Chip>
            );
          })}
        </div>
      );
    }

    case 'checkbox':
      return (
        <button
          type="button"
          onClick={() => onChange(!value)}
          style={{
            display: 'flex', alignItems: 'center', gap: S.s3, width: '100%',
            padding: `${S.s3}px ${S.s4}px`, borderRadius: S.r3, cursor: 'pointer',
            background: value ? alpha(C.green, 10) : C.surface,
            border: `1px solid ${value ? alpha(C.green, 40) : C.border}`,
            color: C.text, fontSize: S.sm, fontWeight: 700, textAlign: 'start',
          }}
        >
          <span
            aria-hidden
            style={{
              width: 20, height: 20, borderRadius: 6, flexShrink: 0,
              display: 'grid', placeItems: 'center',
              background: value ? C.green : 'transparent',
              border: `1.5px solid ${value ? C.green : C.border}`,
              color: '#fff', fontSize: 13, fontWeight: 900,
            }}
          >
            {value ? '✓' : ''}
          </span>
          {field.label}
        </button>
      );

    case 'date':
      return (
        <input
          {...common}
          dir="ltr"
          style={{ ...common.style, textAlign: 'right' as const }}
          placeholder={field.placeholder || '۱۴۰۵/۰۶/۱۵'}
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value)}
        />
      );

    case 'location': {
      const point = Number.isFinite(value?.lat) ? { lat: value.lat, lng: value.lng } : null;
      return (
        <div>
          {/* The picker fills its parent, so the height lives here. */}
          <div style={{ height: 240, borderRadius: S.r3, overflow: 'hidden', border: `1px solid ${C.border}` }}>
            <MapPicker
              center={point || DEFAULT_CENTER}
              selectedLocation={point}
              onLocationSelect={(latlng) =>
                onChange({ lat: latlng.lat, lng: latlng.lng, address: value?.address || '' })
              }
            />
          </div>
          <input
            className="pm-field"
            style={{ width: '100%', marginTop: S.s2 }}
            placeholder="نشانی (اختیاری)"
            value={value?.address ?? ''}
            onChange={(e) => onChange({ ...(value || {}), address: e.target.value })}
          />
        </div>
      );
    }

    case 'file':
    case 'files': {
      const max = field.type === 'file' ? 1 : field.maxFiles || 4;
      return (
        <div style={{ display: 'grid', gap: S.s2 }}>
          <label
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: S.s2,
              padding: `${S.s4}px`, borderRadius: S.r3, cursor: 'pointer',
              border: `1px dashed ${C.border}`, background: C.surface2,
              color: C.muted, fontSize: S.xs, fontWeight: 700,
            }}
          >
            <Paperclip className="h-4 w-4" />
            {files.length ? `${files.length} فایل انتخاب شد` : `افزودن فایل (حداکثر ${max})`}
            <input
              type="file"
              hidden
              multiple={max > 1}
              accept="image/*,application/pdf"
              onChange={(e) => {
                const picked = Array.from(e.target.files || []);
                onFiles(max === 1 ? picked.slice(0, 1) : [...files, ...picked].slice(0, max));
                // Let the same file be chosen again after it was removed.
                e.currentTarget.value = '';
              }}
            />
          </label>

          {files.map((file, i) => (
            <div
              key={`${file.name}-${i}`}
              style={{
                display: 'flex', alignItems: 'center', gap: S.s2,
                padding: `${S.s2}px ${S.s3}px`, borderRadius: S.r2,
                background: C.surface, border: `1px solid ${C.border}`,
              }}
            >
              <span style={{ flex: 1, minWidth: 0, fontSize: S.xs, color: C.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {file.name}
              </span>
              <button
                type="button"
                aria-label="حذف فایل"
                onClick={() => onFiles(files.filter((_, at) => at !== i))}
                style={{ background: 'none', border: 0, cursor: 'pointer', color: C.statusDanger, display: 'grid', placeItems: 'center' }}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      );
    }

    case 'text':
    case 'plate':
    default:
      return (
        <input
          {...common}
          maxLength={field.maxLength || 200}
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value)}
        />
      );
  }
}

/* ── the form ────────────────────────────────────────────────────────────── */

export function DynamicForm({
  form,
  values,
  files,
  onChange,
  onFiles,
}: {
  form: FormDefinition | null;
  values: FormValues;
  files: FormFiles;
  onChange: (key: string, value: any) => void;
  onFiles: (key: string, list: File[]) => void;
}) {
  const sections = useMemo(() => form?.sections || [], [form]);

  return (
    <div style={{ display: 'grid', gap: S.s5 }}>
      {sections.map((section, index) => {
        const shown = (section.fields || []).filter((f) => isVisible(f, values));
        // A section whose every field is conditional and hidden is not an
        // empty box with a heading — it is not there at all.
        if (!shown.length) return null;

        return (
          <section key={`${section.title}-${index}`} style={{ display: 'grid', gap: S.s4 }}>
            <div>
              <p style={{ margin: 0, fontSize: S.sm, fontWeight: 800, color: C.textStrong }}>{section.title}</p>
              {section.description && (
                <p style={{ margin: '5px 0 0', fontSize: S.xs, color: C.muted, lineHeight: 1.8 }}>
                  {section.description}
                </p>
              )}
            </div>

            {shown.map((field) =>
              field.type === 'note' ? (
                <p
                  key={field.key}
                  style={{
                    margin: 0, padding: `${S.s3}px ${S.s4}px`, borderRadius: S.r3,
                    background: alpha(C.statusInfo, 8), border: `1px solid ${alpha(C.statusInfo, 20)}`,
                    fontSize: S.xs, color: C.muted, lineHeight: 1.9,
                  }}
                >
                  {field.hint || field.label}
                </p>
              ) : field.type === 'checkbox' ? (
                // Its own label is inside the control, so it is not wrapped.
                <div key={field.key}>
                  <FieldInput
                    field={field}
                    value={values[field.key]}
                    files={files[field.key] || []}
                    onChange={(v) => onChange(field.key, v)}
                    onFiles={(list) => onFiles(field.key, list)}
                  />
                  {field.hint && (
                    <span style={{ display: 'block', marginTop: 6, fontSize: S.xs, color: C.muted, lineHeight: 1.7 }}>
                      {field.hint}
                    </span>
                  )}
                </div>
              ) : (
                <Field
                  key={field.key}
                  label={field.required ? `${field.label} *` : field.label}
                  hint={field.hint}
                >
                  <FieldInput
                    field={field}
                    value={values[field.key]}
                    files={files[field.key] || []}
                    onChange={(v) => onChange(field.key, v)}
                    onFiles={(list) => onFiles(field.key, list)}
                  />
                </Field>
              ),
            )}
          </section>
        );
      })}
    </div>
  );
}

/**
 * Answers plus documents, in the shape the API expects.
 *
 * `values` travels as a JSON string because multipart form-data has no way to
 * carry a nested object beside files, and each file is named `file:<fieldKey>`
 * so the server can put it back with the question it answered.
 */
export function toFormData(values: FormValues, files: FormFiles, extra: Record<string, string> = {}) {
  const data = new FormData();
  data.append('values', JSON.stringify(values));
  for (const [key, value] of Object.entries(extra)) data.append(key, value);
  for (const [key, list] of Object.entries(files)) {
    for (const file of list) data.append(`file:${key}`, file);
  }
  return data;
}

/** Reading a stored answer back — the saved file, not the form. */
export function displayValue(field: FormField, value: any): string {
  if (value === undefined || value === null || value === '') return '—';
  switch (field.type) {
    case 'checkbox':
      return value ? 'بله' : 'خیر';
    case 'select':
      return (field.options || []).find((o) => String(o.value) === String(value))?.label || String(value);
    case 'multiselect': {
      const chosen = Array.isArray(value) ? value : [value];
      return chosen
        .map((v) => (field.options || []).find((o) => String(o.value) === String(v))?.label || String(v))
        .join('، ');
    }
    case 'location':
      return value?.address || `${value?.lat ?? ''}، ${value?.lng ?? ''}`;
    case 'number':
    case 'area':
    case 'money':
      return Number(value).toLocaleString('fa-IR');
    default:
      return String(value);
  }
}
