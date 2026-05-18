export type ApplicationStatus =
  | "Gemerkt"
  | "Beworben"
  | "Interview"
  | "Angebot"
  | "Abgelehnt"
  | "Abgebrochen";

export type ActivityType =
  | "beworben"
  | "interview"
  | "angebot"
  | "absage"
  | "follow_up"
  | "notiz";

export interface Application {
  id: string;
  user_id: string;
  company: string;
  position: string;
  location: string | null;
  job_url: string | null;
  status: ApplicationStatus;
  applied_at: string | null;
  response_at: string | null;
  salary_min: number | null;
  salary_max: number | null;
  excitement: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Activity {
  id: string;
  user_id: string;
  application_id: string;
  type: ActivityType;
  occurred_at: string;
  notes: string | null;
}

export type ApplicationInsert = Omit<Application, "id" | "user_id" | "created_at" | "updated_at">;
export type ApplicationUpdate = Partial<ApplicationInsert>;
export type ActivityInsert = Omit<Activity, "id" | "user_id">;

export const STATUS_ORDER: ApplicationStatus[] = [
  "Gemerkt",
  "Beworben",
  "Interview",
  "Angebot",
  "Abgelehnt",
];

export const ACTIVITY_LABELS: Record<ActivityType, string> = {
  beworben: "Beworben",
  interview: "Interview",
  angebot: "Angebot erhalten",
  absage: "Absage",
  follow_up: "Follow-Up",
  notiz: "Notiz",
};
