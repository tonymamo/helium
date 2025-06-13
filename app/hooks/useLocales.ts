import { useQuery } from "@tanstack/react-query";
import { Locale } from "../models/Locale";

const fetchLocales = async (): Promise<Locale[]> => {
  const response = await fetch("/api/locales");
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Failed to fetch locales");
  }
  return response.json();
};

export function useLocales() {
  const query = useQuery({
    queryKey: ["locales"],
    queryFn: fetchLocales,
  });

  return {
    locales: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
  };
}
