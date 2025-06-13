export interface TranslationKey {
  id: string;
  key: string; // e.g., "button.save"
  category: string; // e.g., "buttons"
  description?: string;
  translations: {
    [languageCode: string]: {
      value: string;
      updated_at: string;
      updated_by: string;
    };
  };
}
