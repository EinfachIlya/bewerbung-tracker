import { createServerSupabaseClient } from "@/lib/supabase-server";
import { getApplications } from "@/app/actions/applications";
import ListView from "@/components/ListView";
import Navbar from "@/components/Navbar";
import type { Application } from "@/lib/types";

export default async function ListPage() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  const applications = await getApplications();

  return (
    <>
      <Navbar userEmail={user?.email} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Listenansicht</h1>
            <p className="text-sm text-slate-500 mt-0.5">{applications?.length ?? 0} Bewerbungen insgesamt</p>
          </div>
        </div>
        <ListView initialApplications={(applications ?? []) as Application[]} />
      </main>
    </>
  );
}
