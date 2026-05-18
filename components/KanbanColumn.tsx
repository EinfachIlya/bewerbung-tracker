"use client";

import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { Plus } from "lucide-react";
import type { Application, ApplicationStatus } from "@/lib/types";
import { STATUS_COLORS } from "@/utils/helpers";
import ApplicationCard from "./ApplicationCard";

interface Props {
  status: ApplicationStatus;
  applications: Application[];
  onAddClick: (status: ApplicationStatus) => void;
  onCardClick: (app: Application) => void;
}

export default function KanbanColumn({ status, applications, onAddClick, onCardClick }: Props) {
  const { setNodeRef, isOver } = useDroppable({ id: status });
  const colors = STATUS_COLORS[status];

  return (
    <div className={`flex flex-col rounded-xl border ${colors.border} min-w-[260px] w-[260px] flex-shrink-0`}>
      <div className={`px-3 py-2.5 ${colors.header} rounded-t-xl flex items-center justify-between`}>
        <div className="flex items-center gap-2">
          <h2 className={`font-semibold text-sm ${colors.text}`}>{status}</h2>
          <span className={`text-xs font-medium px-1.5 py-0.5 rounded-full bg-white/60 ${colors.text}`}>
            {applications.length}
          </span>
        </div>
        <button
          onClick={() => onAddClick(status)}
          className={`p-1 rounded-md hover:bg-white/60 transition-colors ${colors.text}`}
          title="Bewerbung hinzufügen"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      <div
        ref={setNodeRef}
        className={`flex-1 p-2 flex flex-col gap-2 min-h-[120px] transition-colors rounded-b-xl ${
          isOver ? colors.bg : "bg-slate-50/50"
        }`}
      >
        <SortableContext items={applications.map((a) => a.id)} strategy={verticalListSortingStrategy}>
          {applications.map((app) => (
            <ApplicationCard key={app.id} application={app} onClick={onCardClick} />
          ))}
        </SortableContext>

        {applications.length === 0 && (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-xs text-slate-400 italic">Keine Einträge</p>
          </div>
        )}
      </div>
    </div>
  );
}
