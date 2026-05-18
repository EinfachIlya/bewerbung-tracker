"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, MessageSquare, Calendar, Phone, Gift, XCircle, ArrowRight } from "lucide-react";
import type { Activity, ActivityType } from "@/lib/types";
import { ACTIVITY_LABELS } from "@/lib/types";
import { createActivity, deleteActivity, getActivities } from "@/app/actions/activities";
import { formatDate } from "@/utils/helpers";

const ACTIVITY_ICONS: Record<ActivityType, React.ReactNode> = {
  beworben:  <ArrowRight className="w-3.5 h-3.5" />,
  interview: <Calendar className="w-3.5 h-3.5" />,
  angebot:   <Gift className="w-3.5 h-3.5" />,
  absage:    <XCircle className="w-3.5 h-3.5" />,
  follow_up: <Phone className="w-3.5 h-3.5" />,
  notiz:     <MessageSquare className="w-3.5 h-3.5" />,
};

const ACTIVITY_COLORS: Record<ActivityType, string> = {
  beworben:  "bg-blue-100 text-blue-700",
  interview: "bg-yellow-100 text-yellow-700",
  angebot:   "bg-green-100 text-green-700",
  absage:    "bg-red-100 text-red-700",
  follow_up: "bg-purple-100 text-purple-700",
  notiz:     "bg-slate-100 text-slate-700",
};

interface Props {
  applicationId: string;
}

export default function ActivityTimeline({ applicationId }: Props) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [newType, setNewType] = useState<ActivityType>("notiz");
  const [newNotes, setNewNotes] = useState("");
  const [newDate, setNewDate] = useState(new Date().toISOString().split("T")[0]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getActivities(applicationId).then((data) => {
      setActivities(data as Activity[]);
      setLoading(false);
    });
  }, [applicationId]);

  async function handleAdd() {
    setSaving(true);
    const activity = await createActivity({
      application_id: applicationId,
      type: newType,
      notes: newNotes || null,
      occurred_at: new Date(newDate).toISOString(),
    });
    setActivities((prev) => [activity as Activity, ...prev]);
    setNewNotes("");
    setNewType("notiz");
    setAdding(false);
    setSaving(false);
  }

  async function handleDelete(id: string) {
    await deleteActivity(id);
    setActivities((prev) => prev.filter((a) => a.id !== id));
  }

  if (loading) {
    return <div className="text-sm text-slate-400 py-4">Lade Aktivitäten…</div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-slate-700">Aktivitäten</h3>
        <button
          onClick={() => setAdding(!adding)}
          className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-medium"
        >
          <Plus className="w-3.5 h-3.5" />
          Eintrag hinzufügen
        </button>
      </div>

      {adding && (
        <div className="mb-4 p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs font-medium text-slate-600 mb-1 block">Typ</label>
              <select
                value={newType}
                onChange={(e) => setNewType(e.target.value as ActivityType)}
                className="w-full text-sm border border-slate-300 rounded-md px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {(Object.keys(ACTIVITY_LABELS) as ActivityType[]).map((t) => (
                  <option key={t} value={t}>{ACTIVITY_LABELS[t]}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600 mb-1 block">Datum</label>
              <input
                type="date"
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                className="w-full text-sm border border-slate-300 rounded-md px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-slate-600 mb-1 block">Notiz (optional)</label>
            <textarea
              value={newNotes}
              onChange={(e) => setNewNotes(e.target.value)}
              rows={2}
              placeholder="Details zum Eintrag…"
              className="w-full text-sm border border-slate-300 rounded-md px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>
          <div className="flex gap-2 justify-end">
            <button
              onClick={() => setAdding(false)}
              className="text-sm px-3 py-1.5 rounded-md text-slate-600 hover:bg-slate-200 transition-colors"
            >
              Abbrechen
            </button>
            <button
              onClick={handleAdd}
              disabled={saving}
              className="text-sm px-3 py-1.5 rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:bg-blue-300 transition-colors"
            >
              {saving ? "Speichert…" : "Speichern"}
            </button>
          </div>
        </div>
      )}

      {activities.length === 0 ? (
        <p className="text-sm text-slate-400 italic py-2">Noch keine Aktivitäten eingetragen.</p>
      ) : (
        <div className="space-y-2">
          {activities.map((activity) => (
            <div key={activity.id} className="flex gap-3 group">
              <div className={`mt-0.5 p-1.5 rounded-full shrink-0 ${ACTIVITY_COLORS[activity.type]}`}>
                {ACTIVITY_ICONS[activity.type]}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-medium text-slate-800">
                    {ACTIVITY_LABELS[activity.type]}
                  </span>
                  <span className="text-xs text-slate-400">
                    {formatDate(activity.occurred_at)}
                  </span>
                </div>
                {activity.notes && (
                  <p className="text-sm text-slate-600 mt-0.5">{activity.notes}</p>
                )}
              </div>
              <button
                onClick={() => handleDelete(activity.id)}
                className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-red-500 transition-all"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
