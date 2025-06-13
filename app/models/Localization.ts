import { TranslationKey } from "./TranslationKey";

export interface Localization {
  [key: string]: TranslationKey;
}

export interface LocalizationResponse {
  project_id: string;
  locale: string;
  localizations: Localization;
}

export interface TranslationUpdate {
  value: string;
  updated_by: string;
}

export interface UpdateLocalizationsPayload {
  localizations: Record<string, TranslationUpdate>;
}
