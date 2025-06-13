"use client";

import { type ReactNode, createContext, useRef, useContext } from "react";
import { useStore } from "zustand";

import {
  type TranslationManagementStore,
  createTranslationManagementStore,
  initTranslationManagementStore,
} from "../lib/store";

export type TranslationManagementStoreApi = ReturnType<
  typeof createTranslationManagementStore
>;

export const TranslationManagementStoreContext = createContext<
  TranslationManagementStoreApi | undefined
>(undefined);

export interface StoreProviderProps {
  children: ReactNode;
}

export const StoreProvider = ({ children }: StoreProviderProps) => {
  const storeRef = useRef<TranslationManagementStoreApi | null>(null);
  if (storeRef.current === null) {
    storeRef.current = createTranslationManagementStore(
      initTranslationManagementStore(),
    );
  }

  return (
    <TranslationManagementStoreContext.Provider value={storeRef.current}>
      {children}
    </TranslationManagementStoreContext.Provider>
  );
};

export const useTranslationManagementStore = <T,>(
  selector: (store: TranslationManagementStore) => T,
): T => {
  const translationManagementStoreContext = useContext(
    TranslationManagementStoreContext,
  );

  if (!translationManagementStoreContext) {
    throw new Error(
      `useTranslationManagementStore must be used within StoreProvider`,
    );
  }

  return useStore(translationManagementStoreContext, selector);
};
