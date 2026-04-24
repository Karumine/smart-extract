"use client";

import { Sparkles, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function Header() {
  return (
    <header className="relative overflow-hidden border-b border-white/10">
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-900" />
      <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/10 via-purple-600/5 to-indigo-600/10" />

      {/* Floating orbs */}
      <div className="absolute -top-20 -left-20 h-40 w-40 rounded-full bg-indigo-500/20 blur-3xl animate-pulse" />
      <div className="absolute -top-10 -right-20 h-60 w-60 rounded-full bg-purple-500/10 blur-3xl animate-pulse delay-1000" />

      <div className="relative mx-auto max-w-6xl px-6 py-6">
        <div className="flex items-center justify-between">
          {/* Logo & Title */}
          <div className="flex items-center gap-3">
            <div className="relative flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/25">
              <Zap className="h-6 w-6 text-white" />
              <div className="absolute -inset-0.5 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 opacity-50 blur-sm -z-10" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white">
                SmartExtract
              </h1>
              <p className="text-xs text-zinc-400">
                Image → Data → Excel
              </p>
            </div>
          </div>

          {/* Badge */}
          <Badge
            variant="secondary"
            className="border-indigo-500/30 bg-indigo-500/10 text-indigo-300 hover:bg-indigo-500/20 transition-colors"
          >
            <Sparkles className="mr-1 h-3 w-3" />
            Powered by Gemini AI
          </Badge>
        </div>
      </div>
    </header>
  );
}
