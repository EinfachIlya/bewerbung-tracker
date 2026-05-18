"use server";

import { revalidatePath } from "next/cache";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import type { ApplicationInsert, ApplicationUpdate, ApplicationStatus } from "@/lib/types";

export async function getApplications() {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("applications")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data;
}

export async function createApplication(input: ApplicationInsert) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Nicht angemeldet");

  const { data, error } = await supabase
    .from("applications")
    .insert({ ...input, user_id: user.id })
    .select()
    .single();

  if (error) throw new Error(error.message);
  revalidatePath("/board");
  revalidatePath("/list");
  revalidatePath("/dashboard");
  return data;
}

export async function updateApplication(id: string, input: ApplicationUpdate) {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("applications")
    .update({ ...input, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  revalidatePath("/board");
  revalidatePath("/list");
  revalidatePath("/dashboard");
  return data;
}

export async function updateApplicationStatus(id: string, status: ApplicationStatus) {
  return updateApplication(id, { status });
}

export async function deleteApplication(id: string) {
  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.from("applications").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/board");
  revalidatePath("/list");
  revalidatePath("/dashboard");
}
