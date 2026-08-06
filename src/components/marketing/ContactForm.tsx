"use client";

import { useActionState } from "react";
import { submitContact, type ContactActionState } from "@/lib/actions/contact";
import { Button } from "@/components/ui/Button";
import { FieldGroup, inputClass } from "@/components/ui/FieldGroup";

const initialState: ContactActionState = { status: "idle" };

export function ContactForm({ kind }: { kind: "contact" | "security_summary" }) {
  const [state, action, pending] = useActionState(submitContact, initialState);

  if (state.status === "success") {
    return (
      <p role="status" className="rounded-[var(--r-md)] border border-line bg-ink-700 p-5">
        {state.message ?? "Message received. We reply within one business day."}
      </p>
    );
  }

  return (
    <form action={action} className="space-y-5" noValidate>
      <input type="hidden" name="kind" value={kind} />
      {/* Honeypot — hidden from real users, silently dropped server-side. */}
      <div aria-hidden="true" className="hidden">
        <label htmlFor="website2">Leave this field empty</label>
        <input id="website2" name="website2" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <FieldGroup id="contact-name" label="Name" error={state.fields?.name}>
        <input
          id="contact-name"
          name="name"
          type="text"
          required
          autoComplete="name"
          className={inputClass}
          aria-invalid={Boolean(state.fields?.name)}
          aria-describedby={state.fields?.name ? "contact-name-error" : undefined}
        />
      </FieldGroup>

      <FieldGroup id="contact-email" label="Email" error={state.fields?.email}>
        <input
          id="contact-email"
          name="email"
          type="email"
          required
          autoComplete="email"
          className={inputClass}
          aria-invalid={Boolean(state.fields?.email)}
          aria-describedby={state.fields?.email ? "contact-email-error" : undefined}
        />
      </FieldGroup>

      <FieldGroup id="contact-company" label="Company (optional)" error={state.fields?.company}>
        <input id="contact-company" name="company" type="text" autoComplete="organization" className={inputClass} />
      </FieldGroup>

      <FieldGroup
        id="contact-message"
        label={kind === "security_summary" ? "What do you need to review?" : "Message"}
        error={state.fields?.message}
      >
        <textarea
          id="contact-message"
          name="message"
          rows={5}
          required
          className={inputClass}
          aria-invalid={Boolean(state.fields?.message)}
          aria-describedby={state.fields?.message ? "contact-message-error" : undefined}
        />
      </FieldGroup>

      {state.status === "error" ? (
        <p role="alert" className="text-sm text-coral">
          {state.message}
        </p>
      ) : null}

      <Button type="submit" disabled={pending}>
        {pending ? "Sending…" : kind === "security_summary" ? "Request security summary" : "Send message"}
      </Button>
    </form>
  );
}
