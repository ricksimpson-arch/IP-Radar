import type { ReactNode } from "react";

/** Label + control + error wiring per SPEC.md §19: programmatic label,
    aria-describedby to the error, error announced as alert. */
export function FieldGroup({
  id,
  label,
  hint,
  error,
  children,
}: {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block font-medium">
        {label}
      </label>
      {hint ? (
        <p id={`${id}-hint`} className="text-sm text-mute">
          {hint}
        </p>
      ) : null}
      {children}
      {error ? (
        <p id={`${id}-error`} role="alert" className="text-sm text-coral">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export const inputClass =
  "w-full min-h-11 rounded-[var(--r-sm)] border border-line bg-ink-800 px-3 py-2 text-paper placeholder:text-faint";
