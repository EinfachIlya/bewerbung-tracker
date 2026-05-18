"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { MapPin, ExternalLink, Calendar } from "lucide-react";
import type { Application } from "@/lib/types";
import { formatDate, STATUS_BADGE, cn, excitement } from "@/utils/helpers";

interface Props {
  application: Application;
  onClick: (app: Application) => void;
}

export default function ApplicationCard({ application, onClick }: Props) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: application.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={() => onClick(application)}
      className={cn(
        "bg-white rounded-lg border border-slate-200 p-3 cursor-pointer hover:shadow-md transition-all select-none",
        isDragging && "opacity-50 shadow-lg rotate-1"
      )}
    >
      <div className="flex items-start justify-between gap-2 mb-1">
        <h3 className="font-semibold text-slate-900 text-sm leading-tight line-clamp-1">
          {application.company}
        </h3>
        {application.excitement && (
          <span className="text-yellow-400 text-xs shrink-0" title={`Interesse: ${application.excitement}/5`}>
            {"★".repeat(application.excitement)}
          </span>
        )}
      </div>

      <p className="text-xs text-slate-600 mb-2 line-clamp-1">{application.position}</p>

      <div className="flex flex-wrap gap-1.5 text-xs text-slate-500">
        {application.location && (
          <span className="flex items-center gap-0.5">
            <MapPin className="w-3 h-3" />
            {application.location}
          </span>
        )}
        {application.applied_at && (
          <span className="flex items-center gap-0.5">
            <Calendar className="w-3 h-3" />
            {formatDate(application.applied_at)}
          </span>
        )}
        {application.job_url && (
          <a
            href={application.job_url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-0.5 text-blue-500 hover:text-blue-700"
          >
            <ExternalLink className="w-3 h-3" />
            Anzeige
          </a>
        )}
      </div>

      {application.salary_min && (
        <div className="mt-2 text-xs text-slate-400">
          {application.salary_min.toLocaleString("de-DE")}
          {application.salary_max ? ` – ${application.salary_max.toLocaleString("de-DE")}` : ""}
          {" €"}
        </div>
      )}
    </div>
  );
}
