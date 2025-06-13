import {
  createColumnHelper,
  FilterFn,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { formatDistance } from "date-fns";
import { useState, useEffect } from "react";
import { useTranslationManagementStore } from "../app/providers/StoreProvider";
import { useShallow } from "zustand/react/shallow";
import { RankingInfo, rankItem } from "@tanstack/match-sorter-utils";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { TranslationKey } from "@/app/models/TranslationKey";
import { Badge } from "./ui/badge";
import EditableCell from "./EditableCell";

const columnHelper = createColumnHelper<TranslationKey>();

declare module "@tanstack/react-table" {
  interface FilterFns {
    fuzzy: FilterFn<unknown>;
  }
  interface FilterMeta {
    itemRank: RankingInfo;
  }
}

// copied from docs at https://tanstack.com/table/v8/docs/framework/react/examples/filters-fuzzy
const fuzzyFilter: FilterFn<any> = (row, columnId, value, addMeta) => {
  // Get all the fields we want to search
  const key = row.getValue("key");
  const category = row.original.category;
  const description = row.original.description || "";
  const translations = row.original.translations;
  const localeCode = Object.keys(translations)[0];
  const translationValue = translations[localeCode].value;

  // Combine all searchable content
  const searchableContent =
    `${key} ${category} ${description} ${translationValue}`.toLowerCase();
  const searchValue = value.toLowerCase();

  // Use the existing rankItem function to do the fuzzy matching
  const itemRank = rankItem(searchableContent, searchValue);

  addMeta({
    itemRank,
  });

  return itemRank.passed;
};

const columns = [
  columnHelper.accessor("key", {
    id: "key",
    header: () => <span>Key</span>,
    cell: (info) => (
      <div className="space-y-1">
        <code className="text-sm font-medium text-stone-600 dark:text-stone-400">
          {info.getValue()}
        </code>
        <div className="text-xs text-stone-500 dark:text-stone-400">
          <Badge variant="outline">{info.row.original.category}</Badge>
          {info.row.original.description && (
            <span className="ml-2">• {info.row.original.description}</span>
          )}
        </div>
      </div>
    ),
  }),
  columnHelper.accessor("translations", {
    id: "value",
    header: () => <span>Value</span>,
    filterFn: "fuzzy",
    cell: (info) => {
      const translations = info.getValue();
      const localeCode = Object.keys(translations)[0];
      const translation = translations[localeCode];

      return (
        <div className="space-y-1">
          <div className="text-sm text-stone-800 dark:text-stone-200">
            <EditableCell
              initialValue={translation.value}
              localizationKey={info.row.original.key}
            />
          </div>
        </div>
      );
    },
  }),
  columnHelper.accessor(
    (row) => {
      const translations = row.translations;
      const localeCode = Object.keys(translations)[0];
      return translations[localeCode].updated_at;
    },
    {
      id: "updated_at",
      header: () => <span>Updated At</span>,
      cell: (info) => (
        <Tooltip>
          <TooltipTrigger className="text-sm text-stone-500 dark:text-stone-400 text-left">
            Updated{" "}
            {formatDistance(new Date(info.getValue()), new Date(), {
              addSuffix: true,
            })}
            <div className="text-xs text-stone-500 dark:text-stone-400">
              by{" "}
              {
                info.row.original.translations[
                  Object.keys(info.row.original.translations)[0]
                ].updated_by
              }
            </div>
          </TooltipTrigger>
          <TooltipContent>
            {new Date(info.getValue()).toLocaleString()}
          </TooltipContent>
        </Tooltip>
      ),
    },
  ),
];

const TranslationKeyManager = ({
  isLoading,
  localizations,
  currentLocale,
}: {
  isLoading: boolean;
  localizations: TranslationKey[];
  currentLocale: string;
}) => {
  const [data, setData] = useState<TranslationKey[]>([]);

  useEffect(() => {
    // Filter translations to only include the current locale
    const filteredData = localizations.map((key) => ({
      ...key,
      translations: {
        [currentLocale]: key.translations[currentLocale],
      },
    }));
    setData(filteredData);
  }, [localizations, currentLocale]);

  const { searchQuery, setSearchQuery } = useTranslationManagementStore(
    useShallow((state) => ({
      searchQuery: state.searchQuery,
      setSearchQuery: state.setSearchQuery,
    })),
  );

  const table = useReactTable({
    data,
    columns,
    filterFns: {
      fuzzy: fuzzyFilter,
    },
    state: {
      globalFilter: searchQuery,
    },
    globalFilterFn: "fuzzy",
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full border-collapse table-fixed">
        <colgroup>
          <col className="w-1/3" />
          <col className="w-1/3" />
          <col className="w-1/3" />
        </colgroup>
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id} className="bg-stone-100 dark:bg-stone-800">
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  className="border border-stone-200 dark:border-stone-700 px-4 py-3 text-left text-sm font-semibold text-stone-700 dark:text-stone-300 whitespace-nowrap"
                >
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {isLoading ? (
            <tr>
              <td colSpan={columns.length} className="text-center">
                <div className="p-6 border border-stone-200 space-y-4 dark:border-stone-700 rounded-b bg-stone-50 dark:bg-stone-800 text-lg text-stone-500 dark:text-stone-400 min-h-[300px] flex flex-col items-center justify-center">
                  <p>Loading localizations...</p>
                </div>
              </td>
            </tr>
          ) : table.getRowModel().rows.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="text-center">
                <div className="p-6 border border-stone-200 space-y-4 dark:border-stone-700 rounded-b bg-stone-50 dark:bg-stone-800 text-lg text-stone-500 dark:text-stone-400 min-h-[300px] flex flex-col items-center justify-center">
                  <p>
                    {searchQuery
                      ? `No translations found for the search query "${searchQuery}"`
                      : "No translations found for this project/locale"}
                  </p>

                  {searchQuery && (
                    <Button
                      variant="outline"
                      onClick={() => setSearchQuery("")}
                    >
                      Clear search query
                    </Button>
                  )}
                </div>
              </td>
            </tr>
          ) : (
            table.getRowModel().rows.map((row, index) => (
              <tr
                key={row.id}
                className={`border-b border-stone-200 dark:border-stone-700 ${
                  index % 2 === 0
                    ? "bg-white dark:bg-stone-900"
                    : "bg-stone-50 dark:bg-stone-800"
                } hover:bg-stone-100 dark:hover:bg-stone-700 transition-colors`}
              >
                {row.getVisibleCells().map((cell) => (
                  <td
                    key={cell.id}
                    className="border-x border-stone-200 dark:border-stone-700 px-4 py-3 whitespace-normal"
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default TranslationKeyManager;
