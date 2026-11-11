import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";

async function OrgList() {
  const supabase = await createServerSupabaseClient();
  const { data: orgs } = await supabase
    .from("organizations")
    .select("id, name, slug")
    .order("created_at");

  if (!orgs || orgs.length === 0) redirect("/orgs/new");

  return (
    <ul className="mt-4 flex flex-col gap-2">
      {orgs.map((org) => (
        <li key={org.id}>
          <Link className="underline" href={`/${org.slug}`}>
            {org.name}
          </Link>
        </li>
      ))}
    </ul>
  );
}

export default function HomePage() {
  return (
    <main className="p-6">
      <h1 className="text-2xl font-semibold">Your workspaces</h1>
      <Suspense fallback={<div className="mt-4 h-12" />}>
        <OrgList />
      </Suspense>
    </main>
  );
}