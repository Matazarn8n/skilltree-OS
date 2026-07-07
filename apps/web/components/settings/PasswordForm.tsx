"use client";

import { useRef, useState, type FormEvent } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";

const MIN_LENGTH = 8;

interface FieldErrors {
  current?: string;
  next?: string;
  confirm?: string;
}

const inputClass =
  "h-10 w-full rounded-lg border bg-[var(--bg-elev)] px-3 text-sm text-[var(--text)] outline-none transition-colors focus-visible:ring-2 focus-visible:ring-[var(--ring)]";

export function PasswordForm() {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [success, setSuccess] = useState(false);

  const currentRef = useRef<HTMLInputElement>(null);
  const nextRef = useRef<HTMLInputElement>(null);
  const confirmRef = useRef<HTMLInputElement>(null);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSuccess(false);

    const nextErrors: FieldErrors = {};
    if (current.trim().length === 0) {
      nextErrors.current = "Renseigne ton mot de passe actuel.";
    }
    if (next.length < MIN_LENGTH) {
      nextErrors.next = `Le nouveau mot de passe doit contenir au moins ${MIN_LENGTH} caractères.`;
    }
    if (confirm !== next) {
      nextErrors.confirm = "La confirmation ne correspond pas au nouveau mot de passe.";
    }

    setErrors(nextErrors);

    if (nextErrors.current) currentRef.current?.focus();
    else if (nextErrors.next) nextRef.current?.focus();
    else if (nextErrors.confirm) confirmRef.current?.focus();

    if (Object.keys(nextErrors).length === 0) {
      setSuccess(true);
      setCurrent("");
      setNext("");
      setConfirm("");
    }
  }

  return (
    <form className="flex flex-col gap-4" onSubmit={handleSubmit} noValidate>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="current-password" className="text-sm text-[var(--text)]">
          Mot de passe actuel
        </label>
        <input
          ref={currentRef}
          id="current-password"
          type="password"
          autoComplete="current-password"
          value={current}
          onChange={(e) => setCurrent(e.target.value)}
          aria-invalid={Boolean(errors.current)}
          aria-describedby={errors.current ? "current-password-error" : undefined}
          className={cn(inputClass, errors.current ? "border-red-500" : "border-[var(--border)]")}
        />
        {errors.current && (
          <p id="current-password-error" role="alert" className="text-sm text-red-500">
            {errors.current}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="new-password" className="text-sm text-[var(--text)]">
          Nouveau mot de passe
        </label>
        <input
          ref={nextRef}
          id="new-password"
          type="password"
          autoComplete="new-password"
          value={next}
          onChange={(e) => setNext(e.target.value)}
          aria-invalid={Boolean(errors.next)}
          aria-describedby={errors.next ? "new-password-error" : "new-password-hint"}
          className={cn(inputClass, errors.next ? "border-red-500" : "border-[var(--border)]")}
        />
        {errors.next ? (
          <p id="new-password-error" role="alert" className="text-sm text-red-500">
            {errors.next}
          </p>
        ) : (
          <p id="new-password-hint" className="text-sm text-[var(--text-faint)]">
            8 caractères minimum.
          </p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="confirm-password" className="text-sm text-[var(--text)]">
          Confirmer le nouveau mot de passe
        </label>
        <input
          ref={confirmRef}
          id="confirm-password"
          type="password"
          autoComplete="new-password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          aria-invalid={Boolean(errors.confirm)}
          aria-describedby={errors.confirm ? "confirm-password-error" : undefined}
          className={cn(inputClass, errors.confirm ? "border-red-500" : "border-[var(--border)]")}
        />
        {errors.confirm && (
          <p id="confirm-password-error" role="alert" className="text-sm text-red-500">
            {errors.confirm}
          </p>
        )}
      </div>

      <div className="flex items-center gap-3">
        <Button type="submit" size="sm">
          Mettre à jour le mot de passe
        </Button>
        {success && (
          <p role="status" className="text-sm text-[var(--accent)]">
            Mot de passe mis à jour.
          </p>
        )}
      </div>
    </form>
  );
}
