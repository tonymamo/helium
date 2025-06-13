import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  LocalizationResponse,
  UpdateLocalizationsPayload,
} from "../models/Localization";

const fetchLocalizations = async (
  projectId: string,
  locale: string,
): Promise<LocalizationResponse> => {
  const response = await fetch(`/api/localizations/${projectId}/${locale}`);
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Failed to fetch localizations");
  }
  return response.json();
};

const updateLocalizations = async (
  projectId: string,
  locale: string,
  payload: UpdateLocalizationsPayload,
): Promise<{ message: string; updated_count: number }> => {
  const response = await fetch(`/api/localizations/${projectId}/${locale}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload.localizations),
  });

  const data = await response.json();

  if (!response.ok) {
    console.error("[Hook] Error updating localizations:", {
      status: response.status,
      statusText: response.statusText,
      data,
    });
    throw new Error(data.detail || "Failed to update localizations");
  }

  return data;
};

export function useLocalizations(projectId: string, locale: string) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["localizations", projectId, locale],
    queryFn: () => fetchLocalizations(projectId, locale),
    enabled: Boolean(projectId && locale),
  });

  const mutation = useMutation({
    mutationFn: (payload: UpdateLocalizationsPayload) => {
      return updateLocalizations(projectId, locale, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["localizations", projectId, locale],
      });
    },
    onError: (error) => {
      console.error("[Mutation] Update failed:", error);
    },
  });

  return {
    localizations: query.data?.localizations ?? {},
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    updateLocalizations: mutation.mutate,
    isUpdating: mutation.isPending,
    updateError: mutation.error,
  };
}
