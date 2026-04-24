"use client";

import { useState, useCallback } from "react";
import { Plus, X, Columns3, RotateCcw, FileText, Receipt, ClipboardList, Tag } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface SchemaBuilderProps {
  columns: string[];
  onColumnsChange: (columns: string[]) => void;
}

const PRESETS = [
  {
    name: "Product Tag",
    icon: Tag,
    columns: ["ID", "Weight", "size", "Price", "Quantity", "Stones"],
  },
  {
    name: "Invoice",
    icon: FileText,
    columns: ["Item Name", "Quantity", "Unit Price", "Total"],
  },
  {
    name: "Receipt",
    icon: Receipt,
    columns: ["Description", "Amount", "Date", "Category"],
  },
  {
    name: "Report",
    icon: ClipboardList,
    columns: ["Title", "Value", "Unit", "Notes"],
  },
];

export default function SchemaBuilder({
  columns,
  onColumnsChange,
}: SchemaBuilderProps) {
  const [newColumn, setNewColumn] = useState("");

  const addColumn = useCallback(() => {
    const trimmed = newColumn.trim();
    if (trimmed && !columns.includes(trimmed)) {
      onColumnsChange([...columns, trimmed]);
      setNewColumn("");
    }
  }, [newColumn, columns, onColumnsChange]);

  const removeColumn = useCallback(
    (index: number) => {
      onColumnsChange(columns.filter((_, i) => i !== index));
    },
    [columns, onColumnsChange]
  );

  const applyPreset = useCallback(
    (preset: (typeof PRESETS)[number]) => {
      onColumnsChange(preset.columns);
    },
    [onColumnsChange]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") {
        e.preventDefault();
        addColumn();
      }
    },
    [addColumn]
  );

  return (
    <Card className="border-zinc-700/50 bg-zinc-900/50 backdrop-blur-sm">
      <div className="p-6">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500/10">
              <Columns3 className="h-4 w-4 text-purple-400" />
            </div>
            <h2 className="text-lg font-semibold text-white">
              Define Columns
            </h2>
          </div>
          {columns.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onColumnsChange([])}
              className="text-zinc-400 hover:text-white"
            >
              <RotateCcw className="mr-1 h-3 w-3" />
              Reset
            </Button>
          )}
        </div>

        {/* Quick Presets */}
        <div className="mb-4">
          <p className="mb-2 text-xs font-medium uppercase tracking-wider text-zinc-500">
            Quick Templates
          </p>
          <div className="flex flex-wrap gap-2">
            {PRESETS.map((preset) => (
              <button
                key={preset.name}
                onClick={() => applyPreset(preset)}
                className="group flex items-center gap-1.5 rounded-lg border border-zinc-700/50 bg-zinc-800/50 px-3 py-1.5 text-sm text-zinc-400 transition-all hover:border-indigo-500/30 hover:bg-indigo-500/10 hover:text-indigo-300"
              >
                <preset.icon className="h-3.5 w-3.5" />
                {preset.name}
              </button>
            ))}
          </div>
        </div>

        {/* Column Input */}
        <div className="mb-4 flex gap-2">
          <Input
            value={newColumn}
            onChange={(e) => setNewColumn(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Enter column name..."
            className="border-zinc-700/50 bg-zinc-800/50 text-white placeholder:text-zinc-500 focus-visible:ring-indigo-500/50"
          />
          <Button
            onClick={addColumn}
            disabled={!newColumn.trim()}
            className="shrink-0 bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-50"
          >
            <Plus className="mr-1 h-4 w-4" />
            Add
          </Button>
        </div>

        {/* Column Tags */}
        {columns.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {columns.map((col, index) => (
              <Badge
                key={`${col}-${index}`}
                variant="secondary"
                className="animate-in fade-in zoom-in duration-200 border-zinc-600/50 bg-zinc-800 text-zinc-200 hover:bg-zinc-700 pr-1.5 text-sm"
              >
                {col}
                <button
                  onClick={() => removeColumn(index)}
                  className="ml-1.5 rounded-full p-0.5 hover:bg-red-500/20 hover:text-red-400 transition-colors"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        ) : (
          <p className="text-sm text-zinc-500 italic">
            No columns defined. Add columns or select a template above.
          </p>
        )}
      </div>
    </Card>
  );
}
