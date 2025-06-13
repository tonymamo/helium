import { useState } from "react";

interface ValidationResult {
  key: string;
  category: string;
  missing_interpolations: Record<string, string[]>;
  inconsistent_interpolations: Record<string, string[]>;
}

export function useTranslationValidation() {
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationResults, setValidationResults] = useState<
    ValidationResult[] | null
  >(null);

  const validateProject = async (projectId: string) => {
    if (!projectId) {
      setError("Project ID is required");
      return;
    }

    setIsValidating(true);
    setError(null);

    try {
      const response = await fetch(`/api/translation-validation/${projectId}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setValidationResults(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "An error occurred during validation",
      );
      setValidationResults(null);
    } finally {
      setIsValidating(false);
    }
  };

  return {
    isValidating,
    error,
    validationResults,
    validateProject,
  };
}
