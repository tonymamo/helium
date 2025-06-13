import { cn } from "@/lib/utils";
import { useState, useRef, FormEvent, useEffect } from "react";
import { Loader2, Pencil } from "lucide-react";
import { useLocalizations } from "@/app/hooks/useLocalizations";
import { useTranslationManagementStore } from "@/app/providers/StoreProvider";
import { useShallow } from "zustand/react/shallow";

interface EditableCellProps {
  initialValue: string;
  localizationKey: string;
}

const EditableCell = ({ initialValue, localizationKey }: EditableCellProps) => {
  const [value, setValue] = useState(initialValue);
  const [isEditing, setIsEditing] = useState(false);
  const cellRef = useRef<HTMLDivElement>(null);
  const lastCaretPosition = useRef<number | null>(null);
  const { selectedProject, selectedLocale } = useTranslationManagementStore(
    useShallow((state) => ({
      selectedProject: state.selectedProject,
      selectedLocale: state.selectedLocale,
    })),
  );
  const { updateLocalizations, isUpdating } = useLocalizations(
    selectedProject,
    selectedLocale,
  );

  useEffect(() => {
    if (isEditing && cellRef.current && lastCaretPosition.current !== null) {
      const range = document.createRange();
      const sel = window.getSelection();

      try {
        range.setStart(
          cellRef.current.childNodes[0],
          lastCaretPosition.current,
        );
        range.collapse(true);
        sel?.removeAllRanges();
        sel?.addRange(range);
      } catch (e) {
        // If setting the range fails, just put cursor at end
        range.selectNodeContents(cellRef.current);
        range.collapse(false);
        sel?.removeAllRanges();
        sel?.addRange(range);
      }
    }
  }, [value, isEditing]);

  const onBlur = async () => {
    setIsEditing(false);
    if (value !== initialValue) {
      try {
        await updateLocalizations({
          localizations: {
            [localizationKey]: {
              value,
              updated_by: selectedProject,
            },
          },
        });
      } catch (error: unknown) {
        console.error("Error updating localizations:", error);
        setValue(initialValue);
        if (cellRef.current) {
          cellRef.current.textContent = initialValue;
        }
      }
    }
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      cellRef.current?.blur();
    }
    if (e.key === "Escape") {
      setValue(initialValue);
      if (cellRef.current) {
        cellRef.current.textContent = initialValue;
      }
      cellRef.current?.blur();
    }
  };

  const onInput = (e: FormEvent<HTMLDivElement>) => {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      lastCaretPosition.current = range.startOffset;
    }
    setValue(e.currentTarget.textContent || "");
  };

  return (
    <div
      ref={cellRef}
      contentEditable
      suppressContentEditableWarning={true}
      onFocus={() => setIsEditing(true)}
      onBlur={onBlur}
      onKeyDown={onKeyDown}
      onInput={onInput}
      className={cn(
        "px-2 py-1 border-0 outline-none cursor-pointer pl-6 relative [&_svg]:opacity-20 hover:[&_svg]:opacity-100",
        {
          "bg-blue-50 ring-2 ring-blue-300": isEditing,
          "hover:bg-white": !isEditing,
          "opacity-50 cursor-wait [&_svg]:opacity-100": isUpdating,
        },
      )}
    >
      <span className="size-4 absolute left-1 top-1/2 -translate-y-1/2">
        {isUpdating ? (
          <Loader2 className="animate-spin size-4" />
        ) : (
          <Pencil className="size-4" />
        )}
      </span>
      {value}
    </div>
  );
};

export default EditableCell;
