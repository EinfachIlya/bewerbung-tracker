import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, parseISO, differenceInDays } from "date-fns";
import { de } from "date-fns/locale/de";
import type { ApplicationStatus } from "@/lib/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateString: string | null): string {
  if (!dateString) return "—";
  try {
    return format(parseISO(dateString), "dd.MM.yyyy", { locale: de });
  } catch {
    return "—";
  }
}

export function daysBetween(from: string | null, to: string | null): number | null {
  if (!from || !to) return null;
  try {
    return differenceInDays(parseISO(to), parseISO(from));
  } catch {
    return null;
  }
}

export const STATUS_COLORS: Record<ApplicationStatus, { bg: string; text: string; border: string; header: string }> = {
  Gemerkt:    { bg: "bg-slate-50",   text: "text-slate-700",  border: "border-slate-200", header: "bg-slate-100" },
  Beworben:   { bg: "bg-blue-50",    text: "text-blue-700",   border: "border-blue-200",  header: "bg-blue-100"  },
  Interview:  { bg: "bg-yellow-50",  text: "text-yellow-700", border: "border-yellow-200",header: "bg-yellow-100"},
  Angebot:    { bg: "bg-green-50",   text: "text-green-700",  border: "border-green-200", header: "bg-green-100" },
  Abgelehnt:  { bg: "bg-red-50",     text: "text-red-700",    border: "border-red-200",   header: "bg-red-100"   },
  Abgebrochen:{ bg: "bg-gray-50",    text: "text-gray-500",   border: "border-gray-200",  header: "bg-gray-100"  },
};

export const STATUS_BADGE: Record<ApplicationStatus, string> = {
  Gemerkt:     "bg-slate-100 text-slate-700",
  Beworben:    "bg-blue-100 text-blue-700",
  Interview:   "bg-yellow-100 text-yellow-700",
  Angebot:     "bg-green-100 text-green-700",
  Abgelehnt:   "bg-red-100 text-red-700",
  Abgebrochen: "bg-gray-100 text-gray-500",
};

export function excitement(value: number | null): string {
  if (!value) return "—";
  return "★".repeat(value) + "☆".repeat(5 - value);
}
