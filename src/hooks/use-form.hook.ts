import { useState, useCallback } from "react";

type ValidateFunction<T> = (values: T) => Record<keyof T, string> | {};

interface UseFormOptions<T> {
  initialValues: T;
  validate?: ValidateFunction<T>;
  onSubmit: (values: T) => Promise<void> | void;
}

export const useForm = <T extends Record<string, any>>({
  initialValues,
  validate,
  onSubmit,
}: UseFormOptions<T>) => {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Record<keyof T, string>>({} as any);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [touched, setTouched] = useState<Record<keyof T, boolean>>({} as any);

  const handleChange = useCallback(
    (field: keyof T) => (value: any) => {
      setValues((prev) => ({ ...prev, [field]: value }));
      if (touched[field]) {
        const newErrors = validate?.(values) || {};
        setErrors(newErrors as any);
      }
    },
    [validate, values, touched],
  );

  const handleBlur = useCallback(
    (field: keyof T) => () => {
      setTouched((prev) => ({ ...prev, [field]: true }));
      const newErrors = validate?.(values) || {};
      setErrors(newErrors as any);
    },
    [validate, values],
  );

  const handleSubmit = useCallback(async () => {
    const validationErrors = validate?.(values) || {};
    setErrors(validationErrors as any);
    const allTouched = Object.keys(values).reduce(
      (acc, key) => ({ ...acc, [key]: true }),
      {} as Record<keyof T, boolean>,
    );
    setTouched(allTouched);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(values);
    } finally {
      setIsSubmitting(false);
    }
  }, [values, validate, onSubmit]);

  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors({} as any);
    setTouched({} as any);
    setIsSubmitting(false);
  }, [initialValues]);

  const setFieldValue = useCallback((field: keyof T, value: any) => {
    setValues((prev) => ({ ...prev, [field]: value }));
  }, []);

  return {
    values,
    errors,
    touched,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
    reset,
    setFieldValue,
    setValues, // для прямого обновления, если нужно
  };
};
