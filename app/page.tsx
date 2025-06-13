"use client";

import { useLocalizations } from "@/app/hooks/useLocalizations";
import { useProjects } from "@/app/hooks/useProjects";
import { useLocales } from "@/app/hooks/useLocales";
import { useTranslationManagementStore } from "@/app/providers/StoreProvider";
import TranslationKeyManager from "@/components/TranslationKeyManager";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function Home() {
  const { projects, isLoading: isLoadingProjects } = useProjects();
  const { locales, isLoading: isLoadingLocales } = useLocales();
  const {
    selectedProject,
    selectedLocale,
    setSelectedProject,
    setSelectedLocale,
    setSearchQuery,
    searchQuery,
  } = useTranslationManagementStore((state) => state);

  const { localizations, isLoading: isLoadingLocalizations } = useLocalizations(
    selectedProject,
    selectedLocale,
  );

  return (
    <div className="flex flex-col min-h-screen bg-stone-100 dark:bg-stone-900 text-stone-800 dark:text-stone-200 font-[family-name:var(--font-geist-sans)]">
      {/* Header */}
      <header className="bg-white dark:bg-stone-800 shadow-md sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <span className="text-xl font-semibold text-stone-700 dark:text-stone-200">
                Helium
              </span>
            </div>
            <nav className="flex items-center space-x-4">
              {/* // TODO: Implement User Profile / Authentication Status */}
              <div className="text-sm p-2 border border-dashed border-stone-300 dark:border-stone-600 rounded-md text-stone-500 dark:text-stone-400">
                [User Profile Placeholder]
              </div>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content Layout (Sidebar + Content Area) */}
      <div className="flex flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Sidebar */}
        <aside className="w-1/4 xl:w-1/5 p-4 bg-white dark:bg-stone-800 shadow rounded-lg mr-8 space-y-6">
          <div>
            <h2 className="text-lg font-semibold mb-3 text-stone-700 dark:text-stone-300">
              Projects
            </h2>
            {isLoadingProjects ? (
              <div className="text-sm text-stone-500 dark:text-stone-400">
                <div role="status" className="animate-pulse w-full">
                  {["w-1/3", "w-3/4", "w-1/2", "w-2/3", "w-2/5"].map(
                    (widthClass, index) => (
                      <div
                        key={index}
                        className={`h-4 bg-gray-200 rounded-full dark:bg-gray-700 mb-2.5 ${widthClass}`}
                      ></div>
                    ),
                  )}
                  <span className="sr-only">Loading projects...</span>
                </div>
              </div>
            ) : (
              <ul className="space-y-1">
                {projects.map((project) => (
                  <li
                    key={project.id}
                    onClick={() => setSelectedProject(project.id)}
                    className={cn(
                      "cursor-pointer p-2 rounded hover:bg-brand-primary/10 active:bg-brand-primary/20 transition-colors",
                      {
                        "bg-brand-primary text-white hover:bg-brand-primary/80 active:bg-brand-primary/80 cursor-default":
                          selectedProject === project.id,
                      },
                    )}
                  >
                    {project.name}
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div>
            <h2 className="text-lg font-semibold mb-3 text-stone-700 dark:text-stone-300">
              Languages
            </h2>
            {isLoadingLocales ? (
              <div className="text-sm text-stone-500 dark:text-stone-400">
                <div role="status" className="animate-pulse w-full">
                  {["w-3/4", "w-1/2", "w-1/3", "w-2/5", "w-1/4", "w-2/3"].map(
                    (widthClass, index) => (
                      <div
                        key={index}
                        className={`h-4 bg-gray-200 rounded-full dark:bg-gray-700 mb-2.5 ${widthClass}`}
                      ></div>
                    ),
                  )}
                  <span className="sr-only">Loading languages...</span>
                </div>
              </div>
            ) : (
              <ul className="space-y-1">
                {locales.map((locale) => (
                  <li
                    key={locale.code}
                    onClick={() => setSelectedLocale(locale.code)}
                    className={cn(
                      "cursor-pointer p-2 rounded hover:bg-brand-primary/10 active:bg-brand-primary/20 transition-colors flex gap-2 items-center",
                      {
                        "bg-brand-primary text-white hover:bg-brand-primary/80 active:bg-brand-primary/80 cursor-default":
                          selectedLocale === locale.code,
                      },
                    )}
                  >
                    <code className="rounded-md text-xs size-6 flex items-center justify-center bg-stone-100 text-stone-600 font-mono font-medium">
                      {locale.code}
                    </code>
                    <span>{locale.name}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="w-3/4 xl:w-4/5 flex flex-col space-y-6">
          {/* Toolbar Area */}
          <div className="bg-white dark:bg-stone-800 shadow rounded-lg p-4 flex items-center justify-between min-h-[60px] gap-4">
            <div className="w-full md:max-w-sm">
              <Input
                type="search"
                onChange={(e) => setSearchQuery(e.target.value)}
                value={searchQuery}
                placeholder="Search for a translation key or value"
              />
            </div>

            <Button>Add Key</Button>
          </div>

          {/* Translation Keys List / Editor Area */}
          <section className="flex-grow bg-white dark:bg-stone-800 shadow rounded-lg p-4 lg:p-6">
            <h2 className="text-xl font-semibold mb-4 text-stone-700 dark:text-stone-300">
              Translation Management Area
            </h2>
            {!selectedProject || !selectedLocale ? (
              <div className="p-6 border border-dashed border-stone-300 dark:border-stone-600 rounded bg-stone-50 dark:bg-stone-700 text-lg text-stone-500 dark:text-stone-400 min-h-[300px] flex items-center justify-center">
                Please select{" "}
                {!selectedProject
                  ? "a project"
                  : !selectedLocale
                    ? "a language"
                    : "a project and language"}{" "}
              </div>
            ) : (
              <>
                <div className="space-y-4">
                  <TranslationKeyManager
                    isLoading={isLoadingLocalizations}
                    key={selectedProject + selectedLocale}
                    currentLocale={selectedLocale}
                    localizations={Object.entries(localizations).map(
                      ([key, data]) => ({
                        id: data.id,
                        key,
                        category: data.category,
                        description: data.description,
                        translations: data.translations,
                      }),
                    )}
                  />
                </div>
              </>
            )}
          </section>
        </main>
      </div>

      {/* Footer */}
      <footer className="bg-white dark:bg-stone-800 border-t border-stone-200 dark:border-stone-700 mt-auto">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 text-center text-sm text-stone-500 dark:text-stone-400">
          <p>
            &copy; {new Date().getFullYear()} Helium Contractor Assignment. Good
            luck!
          </p>
          <div className="mt-1">
            <a href="#" className="hover:underline mx-2">
              Documentation (Placeholder)
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
