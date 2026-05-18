"use client";

import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, Legend
} from "recharts";
import type { Application, ApplicationStatus } from "@/lib/types";
import { STATUS_ORDER } from "@/lib/types";
import { STATUS_BADGE, formatDate, daysBetween } from "@/utils/helpers";
import { cn } from "@/utils/helpers";

const STATUS_CHART_COLORS: Record<ApplicationStatus, string> = {
  Gemerkt:     "#94a3b8",
  Beworben:    "#3b82f6",
  Interview:   "#eab308",
  Angebot:     "#22c55e",
  Abgelehnt:   "#ef4444",
  Abgebrochen: "#9ca3af",
};

interface Props {
  applications: Application[];
}

export default function DashboardCharts({ applications }: Props) {
  const total = applications.length;
  const withResponse = applications.filter((a) => a.response_at).length;
  const interviews = applications.filter((a) =>
    ["Interview", "Angebot", "Abgelehnt"].includes(a.status) && a.applied_at
  ).length;
  const offers = applications.filter((a) => a.status === "Angebot").length;

  const responseTimes = applications
    .map((a) => daysBetween(a.applied_at, a.response_at))
    .filter((d): d is number => d !== null && d >= 0);
  const avgResponseTime = responseTimes.length
    ? Math.round(responseTimes.reduce((s, d) => s + d, 0) / responseTimes.length)
    : null;

  const pieData = STATUS_ORDER.map((status) => ({
    name: status,
    value: applications.filter((a) => a.status === status).length,
  })).filter((d) => d.value > 0);

  const barData = STATUS_ORDER.map((status) => ({
    status,
    Anzahl: applications.filter((a) => a.status === status).length,
  }));

  const recent = [...applications]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 10);

  const stats = [
    { label: "Bewerbungen gesamt", value: total, color: "text-slate-900" },
    { label: "Antwortquote", value: total ? `${Math.round((withResponse / total) * 100)} %` : "—", color: "text-blue-600" },
    { label: "Interview-Rate", value: total ? `${Math.round((interviews / total) * 100)} %` : "—", color: "text-yellow-600" },
    { label: "Angebote", value: offers, color: "text-green-600" },
    { label: "Ø Reaktionszeit", value: avgResponseTime !== null ? `${avgResponseTime} Tage` : "—", color: "text-purple-600" },
  ];

  return (
    <div className="space-y-8">
      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="bg-white rounded-xl border border-slate-200 p-4">
            <p className="text-xs text-slate-500 mb-1">{s.label}</p>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h3 className="text-sm font-semibold text-slate-700 mb-4">Status-Verteilung (Balken)</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={barData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
              <XAxis dataKey="status" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="Anzahl" radius={[4, 4, 0, 0]}>
                {barData.map((entry) => (
                  <Cell key={entry.status} fill={STATUS_CHART_COLORS[entry.status as ApplicationStatus]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h3 className="text-sm font-semibold text-slate-700 mb-4">Status-Verteilung (Donut)</h3>
          {pieData.length === 0 ? (
            <div className="h-[220px] flex items-center justify-center text-slate-400 text-sm italic">
              Noch keine Daten
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%"
                  innerRadius={55} outerRadius={90} paddingAngle={2}>
                  {pieData.map((entry) => (
                    <Cell key={entry.name} fill={STATUS_CHART_COLORS[entry.name as ApplicationStatus]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend iconType="circle" iconSize={10} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Letzte 10 Bewerbungen */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200">
          <h3 className="text-sm font-semibold text-slate-700">Letzte 10 Bewerbungen</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50">
              <tr>
                {["Firma", "Position", "Status", "Beworben am", "Antwort am"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recent.map((app) => (
                <tr key={app.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-slate-900">{app.company}</td>
                  <td className="px-4 py-3 text-slate-600 max-w-[180px] truncate">{app.position}</td>
                  <td className="px-4 py-3">
                    <span className={cn("px-2 py-0.5 rounded-full text-xs font-medium", STATUS_BADGE[app.status])}>
                      {app.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-500 whitespace-nowrap">{formatDate(app.applied_at)}</td>
                  <td className="px-4 py-3 text-slate-500 whitespace-nowrap">{formatDate(app.response_at)}</td>
                </tr>
              ))}
              {recent.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-slate-400 italic">
                    Noch keine Bewerbungen
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
