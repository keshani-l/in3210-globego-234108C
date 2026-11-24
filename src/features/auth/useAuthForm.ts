import { useRef, useState } from 'react';
import type { z } from 'zod';

import { authErrorMessage } from './authApi';

export function useAuthForm<Fields extends Record<string, string>>(
  initial: Fields,
  schema: z.ZodType<Fields>,
  operation: 'login' | 'register',
  submit: (fields: Fields) => Promise<unknown>,
) {
  const [fields, setFields] = useState(initial);
  const [errors, setErrors] = useState<Partial<Record<keyof Fields, string>>>({});
  const [requestError, setRequestError] = useState<string>();
  const [busy, setBusy] = useState(false);
  const submitting = useRef(false);

  function field(name: keyof Fields) {
    return {
      value: fields[name],
      error: errors[name],
      editable: !busy,
      onChangeText: (value: string) => {
        setFields((previous) => ({ ...previous, [name]: value }));
        setErrors((previous) => ({ ...previous, [name]: undefined }));
        setRequestError(undefined);
      },
    };
  }

  async function send() {
    if (submitting.current) return;
    const result = schema.safeParse(fields);
    setRequestError(undefined);
    if (!result.success) {
      const messages: Partial<Record<keyof Fields, string>> = {};
      for (const issue of result.error.issues) {
        const name = issue.path[0] as keyof Fields;
        messages[name] ??= issue.message;
      }
      setErrors(messages);
      return;
    }

    setErrors({});
    submitting.current = true;
    setBusy(true);
    try {
      await submit(result.data);
      setFields(initial);
    } catch (error) {
      setRequestError(authErrorMessage(error, operation));
    } finally {
      submitting.current = false;
      setBusy(false);
    }
  }

  return { field, send, busy, requestError };
}
