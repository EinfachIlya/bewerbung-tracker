import { createServerSupabaseClient } from "@/lib/supabase-server";
import { getApplications } from "@/app/actions/applications";
import KanbanBoard from "@/components/KanbanBoard";
import Navbar from "@/components/Navbar";
import type { Application } from "@/lib/types";

export default async function BoardPage() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  const applications = await getApplications();

  return (
    <>
      <Navbar userEmail={user?.email} />
      <main className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <KanbanBoard initialApplications={(applications ?? []) as Application[]} />
      </main>
    </>
  );
}
