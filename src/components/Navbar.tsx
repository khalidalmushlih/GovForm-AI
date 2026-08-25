import React from 'react';
import { Shield, Database, Code2, Sparkles, FileSpreadsheet } from 'lucide-react';

interface NavbarProps {
  onOpenArchitecture: () => void;
  onOpenDatabase: () => void;
  applicationsCount: number;
  d1Status: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenArchitecture,
  onOpenDatabase,
  applicationsCount,
  d1Status,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-950/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 via-indigo-600 to-sky-500 shadow-md shadow-blue-500/20 ring-1 ring-white/10">
            <Shield className="h-5 w-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-black tracking-tight text-white">GovForm</span>
              <span className="rounded bg-sky-500/20 px-1.5 py-0.5 text-[11px] font-bold tracking-wide text-sky-300 ring-1 ring-sky-500/30">
                AI • SSR
              </span>
            </div>
            <p className="hidden text-xs text-slate-400 sm:block">
              Cloudflare Workers • Gemini 1.5/3.7 Vision • Astro Islands
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Cloudflare D1 Status Badge */}
          <div
            id="nav-d1-status"
            className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900/80 px-2.5 py-1.5 text-xs text-slate-300"
            title="Cloudflare D1 SQLite database binding active"
          >
            <span
              className={`h-2 w-2 rounded-full ${
                d1Status ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
              }`}
            />
            <span className="hidden font-mono text-[11px] sm:inline">env.DB:</span>
            <span className="font-semibold text-slate-200">D1 Active</span>
          </div>

          {/* Database Records Button */}
          <button
            id="nav-btn-records"
            onClick={onOpenDatabase}
            className="flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-800/90 px-3 py-1.5 text-xs font-semibold text-slate-200 transition-colors hover:border-slate-600 hover:bg-slate-700 hover:text-white"
          >
            <Database className="h-3.5 w-3.5 text-sky-400" />
            <span className="hidden sm:inline">D1 Records</span>
            <span className="rounded-full bg-sky-500/20 px-1.5 py-0.2 text-[10px] font-bold text-sky-300">
              {applicationsCount}
            </span>
          </button>

          {/* Astro & Cloudflare Code Drawer Button */}
          <button
            id="nav-btn-architecture"
            onClick={onOpenArchitecture}
            className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm shadow-blue-600/30 transition-all hover:from-blue-500 hover:to-indigo-500"
          >
            <Code2 className="h-3.5 w-3.5" />
            <span>Astro & D1 Code</span>
          </button>
        </div>
      </div>
    </header>
  );
};
