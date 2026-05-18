"use server";

import { revalidatePath } from "next/cache";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import type { ActivityInsert } from "@/lib/types";

export async function getActivities(applicationId: string) {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("activities")
    .select("*")
    .eq("application_id", applicationId)
    .order("occurred_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data;
}

export async function createActivity(input: ActivityInsert) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Nicht angemeldet");

  const { data, error } = await supabase
    .from("activities")
    .insert({ ...input, user_id: user.id })
    .select()
    .single();

  if (error) throw new Error(error.message);
  revalidatePath("/board");
  return data;
}

export async function deleteActivity(id: string) {
  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.from("activities").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/board");
}
