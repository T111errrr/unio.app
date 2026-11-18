import { useId, type InputHTMLAttributes, type SelectHTMLAttributes } from "react";
import { cx } from "@/lib/cx";
import { Icon } from "./Icon";

type Common = {
  label?: string;
  helper?: string;
  /** Pesan galat; bila ada, kolom berstatus Error (garis merah + teks merah). */
  error?: string;
};

function shellClass(hasError: boolean, disabled?: boolean) {
  return cx(
    "flex h-14 items-center gap-2.5 rounded-(--radius-control) border-[1.5px] bg-field pl-6 pr-5",
    "transition-colors duration-(--duration-fade) focus-within:bg-surface",
    hasError ? "border-destructive focus-within:border-destructive" : "border-transparent focus-within:border-accent",
    disabled && "opacity-50",
  );
}

function Described({ id, helper, error }: { id: string; helper?: string; error?: string }) {
  if (!error && !helper) return null;
  return (
    <p id={id} className={cx("t-footnote", error ? "text-destructive" : "text-ink-secondary")}>
      {error ?? helper}
    </p>
  );
}

export type TextFieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, "size"> &
  Common & {
    /** Figma: Type = Text / Currency */
    kind?: "text" | "currency";
  };

export function TextField({ label, helper, error, kind = "text", className, id, disabled, ...rest }: TextFieldProps) {
  const auto = useId();
  const inputId = id ?? auto;
  const descId = `${inputId}-desc`;

  return (
    <div className={cx("flex flex-col gap-2", className)}>
      {label && (
        <label htmlFor={inputId} className="t-callout text-ink-secondary">
          {label}
        </label>
      )}
      <div className={shellClass(!!error, disabled)}>
        {kind === "currency" && <span className="t-body text-ink-secondary">Rp</span>}
        <input
          id={inputId}
          disabled={disabled}
          inputMode={kind === "currency" ? "numeric" : rest.inputMode}
          aria-invalid={error ? true : undefined}
          aria-describedby={error || helper ? descId : undefined}
          className="t-body min-w-0 flex-1 bg-transparent text-ink outline-none placeholder:text-ink-tertiary"
          {...rest}
        />
      </div>
      <Described id={descId} helper={helper} error={error} />
    </div>
  );
}

export type SelectFieldProps = SelectHTMLAttributes<HTMLSelectElement> & Common;

/** Figma: Text Field Type = Select (pilihan bawaan browser, tampilan sama). */
export function SelectField({ label, helper, error, className, id, disabled, children, ...rest }: SelectFieldProps) {
  const auto = useId();
  const selectId = id ?? auto;
  const descId = `${selectId}-desc`;

  return (
    <div className={cx("flex flex-col gap-2", className)}>
      {label && (
        <label htmlFor={selectId} className="t-callout text-ink-secondary">
          {label}
        </label>
      )}
      <div className={cx(shellClass(!!error, disabled), "relative")}>
        <select
          id={selectId}
          disabled={disabled}
          aria-invalid={error ? true : undefined}
          aria-describedby={error || helper ? descId : undefined}
          className="t-body min-w-0 flex-1 appearance-none bg-transparent text-ink outline-none"
          {...rest}
        >
          {children}
        </select>
        <span className="pointer-events-none text-ink-secondary">
          <Icon name="chevron-down" size="small" />
        </span>
      </div>
      <Described id={descId} helper={helper} error={error} />
    </div>
  );
}
