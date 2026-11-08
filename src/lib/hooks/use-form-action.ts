"use client";

import { useActionState, useEffect, useRef, useTransition, type FormEvent } from "react";

type Result = { ok: boolean; message: string } | null;

/**
 * Like useActionState, but submits through onSubmit so React does NOT reset the
 * form afterwards: typed values survive validation errors. With `resetOnSuccess`
 * the form is cleared only once the action reports success.
 */
export function useFormAction(
  action: (prev: Result, formData: FormData) => Promise<Result>,
  { resetOnSuccess = false }: { resetOnSuccess?: boolean } = {},
) {
  const [state, dispatch] = useActionState<Result, FormData>(action, null);
  const [pending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (resetOnSuccess && state?.ok) formRef.current?.reset();
  }, [state, resetOnSuccess]);

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(() => dispatch(fd));
  };

  return { state, pending, formRef, onSubmit };
}
