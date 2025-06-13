import { createStore } from "zustand/vanilla";
import { persist, createJSONStorage } from "zustand/middleware";

export type TranslationManagementState = {
  selectedProject: string;
  selectedLocale: string;
  searchQuery: string;
};

export type TranslationManagementActions = {
  setSelectedProject: (project: string) => void;
  setSelectedLocale: (locale: string) => void;
  setSearchQuery: (query: string) => void;
};

export type TranslationManagementStore = TranslationManagementState &
  TranslationManagementActions;

export const initTranslationManagementStore =
  (): TranslationManagementState => {
    return { selectedProject: "", selectedLocale: "", searchQuery: "" };
  };

export const defaultInitState: TranslationManagementState = {
  selectedProject: "",
  selectedLocale: "",
  searchQuery: "",
};

export const createTranslationManagementStore = (
  initState: TranslationManagementState = defaultInitState,
) => {
  return createStore<TranslationManagementStore>()(
    persist(
      (set) => ({
        ...initState,
        setSelectedProject: (project: string) =>
          set({ selectedProject: project }),
        setSelectedLocale: (locale: string) => set({ selectedLocale: locale }),
        setSearchQuery: (query: string) => set({ searchQuery: query }),
      }),
      {
        name: "helium-store",
        storage: createJSONStorage(() => localStorage),
      },
    ),
  );
};
