import { useQuery } from "@tanstack/react-query";
import { Project } from "../models/Project";

const fetchProjects = async (): Promise<Project[]> => {
  const response = await fetch("/api/projects");
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Failed to fetch projects");
  }
  return response.json();
};

export function useProjects() {
  const query = useQuery({
    queryKey: ["projects"],
    queryFn: fetchProjects,
  });

  return {
    projects: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
  };
}
