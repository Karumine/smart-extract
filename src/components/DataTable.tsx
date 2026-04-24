"use client";

import { useState, useCallback, useRef } from "react";
import { Trash2, Plus, TableIcon, Pencil, Check, Eye, Copy, ArrowLeftRight, GripHorizontal } from "lucide-react";
import { motion, useDragControls } from "framer-motion";
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogPortal,
  DialogOverlay,
} from "@/components/ui/dialog";

interface DataTableProps {
  columns: string[];
  data: Record<string, string | null>[];
  onDataChange: (data: Record<string, string | null>[]) => void;
  isLoading: boolean;
}

export default function DataTable({ columns, data, onDataChange, isLoading }: DataTableProps) {
  const [editingCell, setEditingCell] = useState<{ row: number; col: string } | null>(null);
  const [editValue, setEditValue] = useState("");
  const [compareRows, setCompareRows] = useState<{ original: number; duplicate: number } | null>(null);
  const dragControls = useDragControls();

  const startEdit = useCallback((ri: number, col: string, val: string | null) => {
    setEditingCell({ row: ri, col });
    setEditValue(val ?? "");
  }, []);

  const confirmEdit = useCallback(() => {
    if (!editingCell) return;
    const nd = [...data];
    nd[editingCell.row] = { ...nd[editingCell.row], [editingCell.col]: editValue || null };
    onDataChange(nd);
    setEditingCell(null);
  }, [editingCell, editValue, data, onDataChange]);

  const deleteRow = useCallback((i: number) => {
    onDataChange(data.filter((_, idx) => idx !== i));
    if (compareRows?.duplicate === i || compareRows?.original === i) {
      setCompareRows(null);
    }
  }, [data, onDataChange, compareRows]);

  const addRow = useCallback(() => {
    const row: Record<string, string | null> = {};
    columns.forEach((c) => (row[c] = null));
    onDataChange([...data, row]);
  }, [columns, data, onDataChange]);

  const keyColumn = columns.includes("ID") ? "ID" : columns[0];
  const valueCounts = new Map<string, number>();
  data.forEach(row => {
    const val = row[keyColumn]?.toString().toLowerCase().trim();
    if (val) valueCounts.set(val, (valueCounts.get(val) || 0) + 1);
  });

  if (isLoading) {
    return (
      <Card className="border-zinc-700/50 bg-zinc-900/50 backdrop-blur-sm">
        <div className="p-6">
          <div className="mb-4 flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10">
              <TableIcon className="h-4 w-4 text-emerald-400" />
            </div>
            <h2 className="text-lg font-semibold text-white">Extracting Data...</h2>
          </div>
          <div className="space-y-3">
            <Skeleton className="h-10 w-full bg-zinc-800" />
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-2">
                {columns.map((c) => <Skeleton key={c} className="h-10 flex-1 bg-zinc-800/60" />)}
              </div>
            ))}
          </div>
          <div className="mt-4 flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-indigo-500 animate-pulse" />
            <p className="text-sm text-zinc-400 animate-pulse">AI is analyzing your image...</p>
          </div>
        </div>
      </Card>
    );
  }

  if (data.length === 0) {
    return (
      <Card className="border-zinc-700/50 bg-zinc-900/50 backdrop-blur-sm">
        <div className="p-6">
          <div className="mb-4 flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10">
              <TableIcon className="h-4 w-4 text-emerald-400" />
            </div>
            <h2 className="text-lg font-semibold text-white">Extracted Data</h2>
          </div>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-800">
              <TableIcon className="h-7 w-7 text-zinc-600" />
            </div>
            <p className="text-sm text-zinc-400">No data extracted yet</p>
            <p className="mt-1 text-xs text-zinc-600">Upload an image and click Extract to see results</p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="border-zinc-700/50 bg-zinc-900/50 backdrop-blur-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="p-6">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10">
              <TableIcon className="h-4 w-4 text-emerald-400" />
            </div>
            <h2 className="text-lg font-semibold text-white">Extracted Data</h2>
            <span className="ml-1 rounded-full bg-indigo-500/10 px-2 py-0.5 text-xs font-medium text-indigo-300">{data.length} rows</span>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={() => { if (confirm("Are you sure you want to clear all data?")) onDataChange([]); }} variant="ghost" size="sm" className="text-zinc-500 hover:text-red-400">
              <Trash2 className="mr-1 h-3 w-3" />Clear All
            </Button>
            <Button onClick={addRow} variant="ghost" size="sm" className="text-zinc-400 hover:text-white">
              <Plus className="mr-1 h-3 w-3" />Add Row
            </Button>
          </div>
        </div>
        <div className="rounded-lg border border-zinc-700/50 overflow-hidden bg-zinc-900/20">
          <Table>
            <TableHeader>
              <TableRow className="border-zinc-700/50 bg-zinc-800/80 hover:bg-zinc-800/80">
                <TableHead className="w-10 text-center text-zinc-400 font-medium px-2">#</TableHead>
                {columns.map((c) => (
                  <TableHead key={c} className="text-zinc-300 font-semibold py-3 px-3">
                    {c}
                  </TableHead>
                ))}
                <TableHead className="w-20" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((row, ri) => {
                const val = row[keyColumn]?.toString().toLowerCase().trim();

                // Check if this is a duplicate AND not the first occurrence
                let isDuplicate = false;
                let firstIndex = -1;
                if (val && (valueCounts.get(val) || 0) > 1) {
                  firstIndex = data.findIndex(r => r[keyColumn]?.toString().toLowerCase().trim() === val);
                  if (ri !== firstIndex) {
                    isDuplicate = true;
                  }
                }

                return (
                  <TableRow key={ri} className={`border-zinc-700/30 transition-colors ${isDuplicate ? "bg-red-500/5 hover:bg-red-500/10 border-red-500/20" : "hover:bg-zinc-800/30"}`}>
                    <TableCell className={`text-center text-xs font-mono px-2 ${isDuplicate ? "text-red-400" : "text-zinc-500"}`}>
                      {ri + 1}
                    </TableCell>
                    {columns.map((c) => (
                      <TableCell key={c} className="p-1 min-w-[100px] align-top">
                        {editingCell?.row === ri && editingCell?.col === c ? (
                          <div className="flex items-center gap-1">
                            <Input value={editValue} onChange={(e) => setEditValue(e.target.value)}
                              onKeyDown={(e) => { if (e.key === "Enter") confirmEdit(); if (e.key === "Escape") setEditingCell(null); }}
                              onBlur={confirmEdit} autoFocus
                              className="h-8 border-indigo-500/50 bg-zinc-800 text-white text-sm" />
                            <Button size="icon" variant="ghost" onClick={confirmEdit} className="h-7 w-7 shrink-0 text-emerald-400">
                              <Check className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        ) : (
                          <div className="relative group h-full">
                            <button onClick={() => startEdit(ri, c, row[c])}
                              className={`flex w-full items-start justify-between rounded-md px-2 py-2 text-left text-sm transition-colors ${isDuplicate && c === keyColumn ? "text-red-300 font-medium" : "text-zinc-300"} hover:bg-zinc-800/50 min-h-[40px]`}>
                              <span className={`break-words whitespace-normal leading-relaxed ${row[c] ? "" : "text-zinc-600 italic"}`}>
                                {row[c] ?? "null"}
                              </span>
                              <div className="flex flex-col items-end gap-1 shrink-0 ml-2">
                                {isDuplicate && c === keyColumn && (
                                  <Badge variant="outline" className="px-1 bg-red-500/10 text-[9px] text-red-400 border-red-500/20 whitespace-nowrap">
                                    #{firstIndex + 1}
                                  </Badge>
                                )}
                                <Pencil className="h-3 w-3 text-zinc-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                              </div>
                            </button>
                          </div>
                        )}
                      </TableCell>
                    ))}
                    <TableCell className="p-1 align-top pt-2">
                      <div className="flex items-center gap-1">
                        {isDuplicate && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-amber-500 hover:text-amber-400 hover:bg-amber-500/10"
                            onClick={() => setCompareRows({ original: firstIndex, duplicate: ri })}
                            title="Compare with original"
                          >
                            <ArrowLeftRight className="h-3.5 w-3.5" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-zinc-600 hover:text-red-400 hover:bg-red-500/10"
                          onClick={() => deleteRow(ri)}
                          title={isDuplicate ? "Discard Duplicate" : "Delete Row"}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
        {Array.from(valueCounts.values()).some(count => count > 1) && (
          <p className="mt-3 text-xs text-red-400 flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
            Found duplicates. Subsequent entries are highlighted in red.
          </p>
        )}
        <p className="mt-3 text-xs text-zinc-500">💡 Click any cell to edit • Click <ArrowLeftRight className="inline h-3 w-3" /> to compare duplicates</p>
      </div>

      {compareRows && (
        <Dialog open={!!compareRows} onOpenChange={() => setCompareRows(null)}>
          <DialogPortal>
            <DialogOverlay />
            <DialogPrimitive.Popup
              data-slot="dialog-content"
              className="fixed top-1/2 left-1/2 z-50 w-full max-w-[calc(100%-2rem)] -translate-x-1/2 -translate-y-1/2 outline-none sm:max-w-lg"
              render={
                <motion.div
                  drag
                  dragControls={dragControls}
                  dragListener={false}
                  dragMomentum={false}
                  className="bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl overflow-hidden text-white flex flex-col"
                />
              }
            >
              <div
                className="bg-zinc-800/80 px-4 py-3 flex items-center justify-between cursor-grab active:cursor-grabbing border-b border-zinc-700/50 select-none"
                onPointerDown={(e) => dragControls.start(e)}
              >
                <div className="flex items-center gap-2">
                  <Copy className="h-4 w-4 text-indigo-400" />
                  <h3 className="font-semibold text-base">Compare Duplicate Records</h3>
                </div>
                <GripHorizontal className="h-4 w-4 text-zinc-500" />
              </div>

              <div className="p-4 sm:p-5">
                <p className="text-zinc-400 text-xs mb-4">
                  Review original and duplicate side-by-side to decide which one to keep.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Original */}
                  <div className="rounded-xl border border-zinc-700/50 bg-zinc-800/30 p-4 flex flex-col justify-between min-h-[300px]">
                    <div>
                      <div className="flex items-center mb-3">
                        <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider">Original (Row #{compareRows.original + 1})</Badge>
                      </div>
                      <div className="space-y-3">
                        {columns.map(c => (
                          <div key={c} className="flex flex-col gap-0.5 border-b border-zinc-800/50 pb-1.5 last:border-0">
                            <span className="text-[9px] uppercase tracking-wider text-zinc-500 font-bold">{c}</span>
                            <span className="text-sm text-zinc-200 leading-snug break-words">{data[compareRows.original][c] ?? "-"}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <Button
                      className="w-full mt-4 bg-emerald-600 hover:bg-emerald-500 font-bold h-9 text-xs shadow-lg shadow-emerald-900/20"
                      onClick={() => deleteRow(compareRows.duplicate)}
                    >
                      เก็บอันเดิมไว้
                    </Button>
                  </div>

                  {/* Duplicate */}
                  <div className="rounded-xl border border-red-500/30 bg-red-500/5 p-4 flex flex-col justify-between min-h-[300px]">
                    <div>
                      <div className="flex items-center mb-3">
                        <Badge className="bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider">Duplicate (Row #{compareRows.duplicate + 1})</Badge>
                      </div>
                      <div className="space-y-3">
                        {columns.map(c => (
                          <div key={c} className="flex flex-col gap-0.5 border-b border-zinc-800/50 pb-1.5 last:border-0">
                            <span className="text-[9px] uppercase tracking-wider text-zinc-500 font-bold">{c}</span>
                            <span className="text-sm text-zinc-200 leading-snug break-words">{data[compareRows.duplicate][c] ?? "-"}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <Button
                      className="w-full mt-4 bg-red-600 hover:bg-red-500 text-white font-bold h-9 text-xs shadow-lg shadow-red-900/20"
                      onClick={() => deleteRow(compareRows.original)}
                    >
                      เลือกอันนี้แทน
                    </Button>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-3 mt-5 pt-4 border-t border-zinc-800/50">
                  <Button variant="ghost" size="sm" onClick={() => setCompareRows(null)} className="text-zinc-400 hover:text-white hover:bg-zinc-800 h-8 text-xs">
                    ยกเลิก
                  </Button>
                  <Button variant="outline" size="sm" className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 h-8 px-4 text-xs" onClick={() => setCompareRows(null)}>
                    เก็บไว้ทั้งคู่
                  </Button>
                </div>
              </div>
            </DialogPrimitive.Popup>
          </DialogPortal>
        </Dialog>
      )}
    </Card>
  );
}
