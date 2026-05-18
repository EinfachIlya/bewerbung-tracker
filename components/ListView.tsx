"use client";

import { useState } from "react";
import { ArrowUpDown, ArrowUp, ArrowDown, ExternalLink } from "lucide-react";
import type { Application, ApplicationStatus } from "@/lib/types";
import { STATUS_BADGE, formatDate, cn } from "@/utils/helpers";
import ApplicationModal from "./ApplicationModal";

type SortKey = "company" | "position" | "status" | "applied_at" | "response_at";
type SortDir = "asc" | "desc";

interface Props {
  initialApplications: Application[];
}

export default function ListView({ initialApplications }: Props) {
  const [applications, setApplications] = useState(initialApplications);
  const [sortKey, setSortKey] = useState<SortKey>("applied_at");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir("asc"); }
  }

  const sorted = [...applications].sort((a, b) => {
    const av = a[sortKey] ?? "";
    const bv = b[sortKey] ?? "";
    const cmp = String(av).localeCompare(String(bv), "de");
    return sortDir === "asc" ? cmp : -cmp;
  });

  function SortIcon({ col }: { col: SortKey }) {
    if (sortKey !== col) return <ArrowUpDown className="w-3.5 h-3.5 opacity-40" />;
    return sortDir === "asc"
      ? <ArrowUp className="w-3.5 h-3.5 text-blue-600" />
      : <ArrowDown className="w-3.5 h-3.5 text-blue-600" />;
  }

  function Th({ col, label }: { col: SortKey; label: string }) {
    return (
      <th
        className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide cursor-pointer hover:text-slate-700 whitespace-nowrap"
        onClick={() => toggleSort(col)}
      >
        <div className="flex items-center gap-1">
          {label}
          <SortIcon col={col} />
        </div>
      </th>
    );
  }

  function handleSaved(app: Application) {
    setApplications((prev) => {
      const exists = prev.find((a) => a.id === app.id);
      if (exists) return prev.map((a) => (a.id === app.id ? app : a));
      return [app, ...prev];
    });
    setModalOpen(false);
    setSelectedApp(null);
  }

  function handleDeleted(id: string) {
    setApplications((prev) => prev.filter((a) => a.id !== id));
    setModalOpen(false);
    setSelectedApp(null);
  }

  return (
    <>
      <div className="overflow-x-auto rounded-xl border border-slate-200">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <Th col="company" label="Firma" />
              <Th col="position" label="Position" />
              <Th col="status" label="Status" />
              <Th col="applied_at" label="Beworben am" />
              <Th col="response_at" label="Antwort am" />
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Interview</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Angebot</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {sorted.map((app) => (
              <tr
                key={app.id}
                className="hover:bg-slate-50 cursor-pointer transition-colors"
                onClick={() => { setSelectedApp(app); setModalOpen(true); }}
              >
                <td className="px-4 py-3 font-medium text-slate-900">{app.company}</td>
                <td className="px-4 py-3 text-slate-600 max-w-[200px] truncate">{app.position}</td>
                <td className="px-4 py-3">
                  <span className={cn("px-2 py-0.5 rounded-full text-xs font-medium", STATUS_BADGE[app.status])}>
                    {app.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-500 whitespace-nowrap">{formatDate(app.applied_at)}</td>
                <td className="px-4 py-3 text-slate-500 whitespace-nowrap">{formatDate(app.response_at)}</td>
                <td className="px-4 py-3">
                  {["Interview", "Angebot"].includes(app.status) || app.status === "Abgelehnt"
                    ? <span className="text-green-600 font-medium">Ja</span>
                    : <span className="text-slate-300">—</span>}
                </td>
                <td className="px-4 py-3">
                  {app.status === "Angebot"
                    ? <span className="text-green-600 font-medium">Ja</span>
                    : <span className="text-slate-300">—</span>}
                </td>
                <td className="px-4 py-3">
                  {app.job_url && (
                    <a href={app.job_url} target="_blank" rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="text-slate-400 hover:text-blue-600">
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </td>
              </tr>
            ))}
            {sorted.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-slate-400 italic">
                  Noch keine Bewerbungen eingetragen.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {modalOpen && selectedApp && (
        <ApplicationModal
          application={selectedApp}
          defaultStatus={selectedApp.status}
          onClose={() => { setModalOpen(false); setSelectedApp(null); }}
          onSaved={handleSaved}
          onDeleted={handleDeleted}
        />
      )}
    </>
  );
}
