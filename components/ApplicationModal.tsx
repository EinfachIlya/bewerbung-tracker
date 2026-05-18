"use client";

import { useState, useTransition } from "react";
import { X, Trash2, ExternalLink, Star } from "lucide-react";
import type { Application, ApplicationStatus, ApplicationInsert } from "@/lib/types";
import { STATUS_ORDER } from "@/lib/types";
import { createApplication, updateApplication, deleteApplication } from "@/app/actions/applications";
import ActivityTimeline from "./ActivityTimeline";
import { cn } from "@/utils/helpers";

interface Props {
  application: Application | null;
  defaultStatus: ApplicationStatus;
  onClose: () => void;
  onSaved: (app: Application) => void;
  onDeleted: (id: string) => void;
}

const EMPTY: ApplicationInsert = {
  company: "",
  position: "",
  location: "",
  job_url: "",
  status: "Gemerkt",
  applied_at: null,
  response_at: null,
  salary_min: null,
  salary_max: null,
  excitement: null,
  notes: "",
};

export default function ApplicationModal({ application, defaultStatus, onClose, onSaved, onDeleted }: Props) {
  const isNew = !application;
  const [form, setForm] = useState<ApplicationInsert>(
    application
      ? {
          company: application.company,
          position: application.position,
          location: application.location ?? "",
          job_url: application.job_url ?? "",
          status: application.status,
          applied_at: application.applied_at,
          response_at: application.response_at,
          salary_min: application.salary_min,
          salary_max: application.salary_max,
          excitement: application.excitement,
          notes: application.notes ?? "",
        }
      : { ...EMPTY, status: defaultStatus }
  );
  const [, startTransition] = useTransition();
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [activeTab, setActiveTab] = useState<"details" | "aktivitaeten">("details");

  function set<K extends keyof ApplicationInsert>(key: K, value: ApplicationInsert[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSave() {
    if (!form.company.trim() || !form.position.trim()) return;
    setSaving(true);
    startTransition(async () => {
      const result = isNew
        ? await createApplication(form)
        : await updateApplication(application.id, form);
      onSaved(result as Application);
      setSaving(false);
    });
  }

  async function handleDelete() {
    if (!application) return;
    if (!confirm(`"${application.company}" wirklich löschen?`)) return;
    setDeleting(true);
    await deleteApplication(application.id);
    onDeleted(application.id);
    setDeleting(false);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <h2 className="text-lg font-semibold text-slate-900">
            {isNew ? "Neue Bewerbung" : `${application.company} – ${application.position}`}
          </h2>
          <div className="flex items-center gap-2">
            {!isNew && (
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tabs (nur bei bestehender Bewerbung) */}
        {!isNew && (
          <div className="flex border-b border-slate-200 px-6">
            {(["details", "aktivitaeten"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "py-2.5 px-1 mr-6 text-sm font-medium border-b-2 -mb-px transition-colors",
                  activeTab === tab
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-slate-500 hover:text-slate-700"
                )}
              >
                {tab === "details" ? "Details" : "Aktivitäten"}
              </button>
            ))}
          </div>
        )}

        {/* Content */}
        <div className="overflow-y-auto flex-1 px-6 py-4">
          {activeTab === "details" ? (
            <div className="space-y-4">
              {/* Firma + Position */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-600 mb-1 block">Firmenname *</label>
                  <input
                    type="text"
                    value={form.company}
                    onChange={(e) => set("company", e.target.value)}
                    placeholder="z.B. Google"
                    className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-600 mb-1 block">Jobtitel *</label>
                  <input
                    type="text"
                    value={form.position}
                    onChange={(e) => set("position", e.target.value)}
                    placeholder="z.B. Software Engineer"
                    className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Ort + URL */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-600 mb-1 block">Ort / Remote</label>
                  <input
                    type="text"
                    value={form.location ?? ""}
                    onChange={(e) => set("location", e.target.value)}
                    placeholder="Berlin / Remote"
                    className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-600 mb-1 block">Link zur Stelle</label>
                  <div className="relative">
                    <input
                      type="url"
                      value={form.job_url ?? ""}
                      onChange={(e) => set("job_url", e.target.value)}
                      placeholder="https://…"
                      className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {form.job_url && (
                      <a href={form.job_url} target="_blank" rel="noopener noreferrer"
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-500">
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                </div>
              </div>

              {/* Status + Bewerbungsdatum */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-600 mb-1 block">Status</label>
                  <select
                    value={form.status}
                    onChange={(e) => set("status", e.target.value as ApplicationStatus)}
                    className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {[...STATUS_ORDER, "Abgebrochen" as ApplicationStatus].map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-600 mb-1 block">Beworben am</label>
                  <input
                    type="date"
                    value={form.applied_at ?? ""}
                    onChange={(e) => set("applied_at", e.target.value || null)}
                    className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Antwort-Datum + Gehalt */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-600 mb-1 block">Antwort erhalten am</label>
                  <input
                    type="date"
                    value={form.response_at ?? ""}
                    onChange={(e) => set("response_at", e.target.value || null)}
                    className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-600 mb-1 block">Gehalt (€ / Jahr)</label>
                  <div className="flex gap-1 items-center">
                    <input
                      type="number"
                      value={form.salary_min ?? ""}
                      onChange={(e) => set("salary_min", e.target.value ? Number(e.target.value) : null)}
                      placeholder="Min"
                      className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="text-slate-400 text-sm">–</span>
                    <input
                      type="number"
                      value={form.salary_max ?? ""}
                      onChange={(e) => set("salary_max", e.target.value ? Number(e.target.value) : null)}
                      placeholder="Max"
                      className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Interesse (Sterne) */}
              <div>
                <label className="text-xs font-medium text-slate-600 mb-1 block">Interesse / Begeisterung</label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => set("excitement", form.excitement === n ? null : n)}
                      className={cn(
                        "p-1 transition-colors",
                        (form.excitement ?? 0) >= n ? "text-yellow-400" : "text-slate-300 hover:text-yellow-300"
                      )}
                    >
                      <Star className="w-5 h-5 fill-current" />
                    </button>
                  ))}
                  {form.excitement && (
                    <button onClick={() => set("excitement", null)} className="ml-1 text-xs text-slate-400 hover:text-slate-600">
                      zurücksetzen
                    </button>
                  )}
                </div>
              </div>

              {/* Notizen */}
              <div>
                <label className="text-xs font-medium text-slate-600 mb-1 block">Notizen</label>
                <textarea
                  value={form.notes ?? ""}
                  onChange={(e) => set("notes", e.target.value)}
                  rows={4}
                  placeholder="Ansprechpartner, Eindrücke, nächste Schritte…"
                  className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>
            </div>
          ) : (
            application && <ActivityTimeline applicationId={application.id} />
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
          >
            Abbrechen
          </button>
          {activeTab === "details" && (
            <button
              onClick={handleSave}
              disabled={saving || !form.company.trim() || !form.position.trim()}
              className="px-4 py-2 text-sm font-medium bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white rounded-lg transition-colors"
            >
              {saving ? "Speichert…" : isNew ? "Anlegen" : "Speichern"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
