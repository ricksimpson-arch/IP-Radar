"use client";

export type Choice = { value: string; label: string; description?: string };

/** Accessible single/multi select rendered as a grid of labeled controls.
    Uses native inputs so keyboard and screen-reader behavior come free. */
export function ChoiceGrid({
  name,
  legend,
  choices,
  multiple,
  selected,
  onChange,
  error,
  errorId,
}: {
  name: string;
  legend: string;
  choices: readonly Choice[];
  multiple: boolean;
  selected: string[];
  onChange: (next: string[]) => void;
  error?: string;
  errorId?: string;
}) {
  const toggle = (value: string, checked: boolean) => {
    if (multiple) {
      onChange(checked ? [...selected, value] : selected.filter((v) => v !== value));
    } else {
      onChange([value]);
    }
  };

  return (
    <fieldset aria-describedby={error ? errorId : undefined}>
      <legend className="mb-3 font-medium">{legend}</legend>
      <div className="grid gap-2 sm:grid-cols-2">
        {choices.map((choice) => {
          const checked = selected.includes(choice.value);
          return (
            <label
              key={choice.value}
              className={`flex min-h-11 cursor-pointer items-start gap-3 rounded-[var(--r-sm)] border p-3 transition-colors duration-120 ${
                checked ? "border-signal bg-ink-700" : "border-line bg-ink-800 hover:bg-ink-700"
              }`}
            >
              <input
                type={multiple ? "checkbox" : "radio"}
                name={name}
                value={choice.value}
                checked={checked}
                onChange={(e) => toggle(choice.value, e.target.checked)}
                className="mt-1.5 accent-[var(--ma-signal)]"
              />
              <span>
                <span className="block">{choice.label}</span>
                {choice.description ? (
                  <span className="block text-sm text-mute">{choice.description}</span>
                ) : null}
              </span>
            </label>
          );
        })}
      </div>
      {error ? (
        <p id={errorId} role="alert" className="mt-2 text-sm text-coral">
          {error}
        </p>
      ) : null}
    </fieldset>
  );
}
