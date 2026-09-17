import React, { useState } from 'react';
import { Database, Copy, Check, Download, X, Layers, Table } from 'lucide-react';

interface SchemaModalProps {
  isOpen: boolean;
  onClose: () => void;
  sqlContent: string;
}

export const SchemaModal: React.FC<SchemaModalProps> = ({ isOpen, onClose, sqlContent }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(sqlContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([sqlContent], { type: 'text/sql' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'schema_satudata_kesehatan_rw.sql';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/75 p-4 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-3xl rounded-2xl bg-slate-900 text-slate-100 shadow-2xl overflow-hidden border border-slate-700 my-6 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 bg-slate-950 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <Database className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold text-white text-base">
                Struktur Basis Data PostgreSQL (SQL Schema)
              </h3>
              <p className="text-xs text-slate-400">
                Relasi lengkap tabel: users, klinik, warga, pemeriksaan_ckg, rekam_medis, early_warning_alerts
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Quick Info Badges */}
        <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 bg-slate-900/80 px-6 py-2.5 text-xs text-slate-300">
          <span className="flex items-center gap-1 rounded bg-slate-800 px-2 py-0.5 font-mono text-emerald-400">
            <Table className="h-3 w-3" /> 6 Tabel Berelasi
          </span>
          <span className="flex items-center gap-1 rounded bg-slate-800 px-2 py-0.5 font-mono text-cyan-400">
            <Layers className="h-3 w-3" /> Foreign Keys & Triggers EWS
          </span>
          <span className="text-slate-500">•</span>
          <span className="text-slate-400">Target RDBMS: PostgreSQL 14 / 15 / 16</span>
        </div>

        {/* SQL Code Box */}
        <div className="flex-1 overflow-y-auto p-6 font-mono text-xs bg-slate-950/60 leading-relaxed text-slate-200">
          <pre className="whitespace-pre overflow-x-auto selection:bg-emerald-500 selection:text-white">
            {sqlContent}
          </pre>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-slate-800 bg-slate-950 px-6 py-4">
          <span className="text-xs text-slate-400">
            Gunakan script ini untuk migrasi database PostgreSQL di server production.
          </span>
          <div className="flex gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-xs font-medium text-slate-200 hover:bg-slate-700 transition"
            >
              {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
              {copied ? 'Tersalin ke Clipboard!' : 'Salin SQL'}
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-500 shadow-sm transition"
            >
              <Download className="h-4 w-4" />
              Download .sql
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
