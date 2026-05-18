"use client";

import { useState, useCallback, useTransition } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { Plus } from "lucide-react";
import type { Application, ApplicationStatus } from "@/lib/types";
import { STATUS_ORDER } from "@/lib/types";
import { updateApplicationStatus } from "@/app/actions/applications";
import KanbanColumn from "./KanbanColumn";
import ApplicationCard from "./ApplicationCard";
import ApplicationModal from "./ApplicationModal";

interface Props {
  initialApplications: Application[];
}

export default function KanbanBoard({ initialApplications }: Props) {
  const [applications, setApplications] = useState<Application[]>(initialApplications);
  const [activeApp, setActiveApp] = useState<Application | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [defaultStatus, setDefaultStatus] = useState<ApplicationStatus>("Gemerkt");
  const [, startTransition] = useTransition();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  const grouped = STATUS_ORDER.reduce<Record<ApplicationStatus, Application[]>>(
    (acc, status) => {
      acc[status] = applications.filter((a) => a.status === status);
      return acc;
    },
    {} as Record<ApplicationStatus, Application[]>
  );

  function handleDragStart(event: DragStartEvent) {
    const app = applications.find((a) => a.id === event.active.id);
    setActiveApp(app ?? null);
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveApp(null);
    if (!over) return;

    const draggedApp = applications.find((a) => a.id === active.id);
    if (!draggedApp) return;

    const newStatus = over.id as ApplicationStatus;
    if (!STATUS_ORDER.includes(newStatus) && newStatus !== draggedApp.status) return;

    const targetStatus: ApplicationStatus = STATUS_ORDER.includes(newStatus as ApplicationStatus)
      ? (newStatus as ApplicationStatus)
      : applications.find((a) => a.id === over.id)?.status ?? draggedApp.status;

    if (targetStatus === draggedApp.status) return;

    setApplications((prev) =>
      prev.map((a) => (a.id === draggedApp.id ? { ...a, status: targetStatus } : a))
    );

    startTransition(async () => {
      await updateApplicationStatus(draggedApp.id, targetStatus);
    });
  }

  function handleAddClick(status: ApplicationStatus) {
    setSelectedApp(null);
    setDefaultStatus(status);
    setModalOpen(true);
  }

  function handleCardClick(app: Application) {
    setSelectedApp(app);
    setModalOpen(true);
  }

  function handleModalClose() {
    setModalOpen(false);
    setSelectedApp(null);
  }

  function handleSaved(app: Application) {
    setApplications((prev) => {
      const exists = prev.find((a) => a.id === app.id);
      if (exists) return prev.map((a) => (a.id === app.id ? app : a));
      return [app, ...prev];
    });
    handleModalClose();
  }

  function handleDeleted(id: string) {
    setApplications((prev) => prev.filter((a) => a.id !== id));
    handleModalClose();
  }

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Bewerbungen</h1>
          <p className="text-sm text-slate-500 mt-0.5">{applications.length} Bewerbungen insgesamt</p>
        </div>
        <button
          onClick={() => handleAddClick("Gemerkt")}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg transition-colors text-sm"
        >
          <Plus className="w-4 h-4" />
          Neue Bewerbung
        </button>
      </div>

      <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className="flex gap-4 overflow-x-auto pb-4">
          {STATUS_ORDER.map((status) => (
            <KanbanColumn
              key={status}
              status={status}
              applications={grouped[status]}
              onAddClick={handleAddClick}
              onCardClick={handleCardClick}
            />
          ))}
        </div>

        <DragOverlay>
          {activeApp && (
            <div className="rotate-2 shadow-xl">
              <ApplicationCard application={activeApp} onClick={() => {}} />
            </div>
          )}
        </DragOverlay>
      </DndContext>

      {modalOpen && (
        <ApplicationModal
          application={selectedApp}
          defaultStatus={defaultStatus}
          onClose={handleModalClose}
          onSaved={handleSaved}
          onDeleted={handleDeleted}
        />
      )}
    </>
  );
}
