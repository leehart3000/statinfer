import { messages } from "@/lib/messages";

/** A form field: its label, with the input underneath. */
export function Field({ label, children }: { label: React.ReactNode; children: React.ReactNode }) {
  return (
    <label className="field">
      {label}
      {children}
    </label>
  );
}

/** Shown in a results section while the form's input isn't valid. */
export function ValidDataNote() {
  return <p className="error">{messages.needsValidData}</p>;
}