import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/status-badge";

type Params = Promise<{ orgSlug: string }>;

async function ProjectsList({ params }: { params: Params }) {
  const { orgSlug } = await params;
  const supabase = await createServerSupabaseClient();

  const { data: org } = await supabase
    .from("organizations")
    .select("id, name")
    .eq("slug", orgSlug)
    .maybeSingle();

  if (!org) notFound();

  const { data: projects } = await supabase
    .from("projects")
    .select("id, name, status, client_id")
    .eq("org_id", org.id)
    .order("created_at", { ascending: false });

  const { data: clients } = await supabase
    .from("clients")
    .select("id, name")
    .eq("org_id", org.id);

  // Build a lookup: client id -> client name
  const clientNames = new Map((clients ?? []).map((c) => [c.id, c.name]));

  return (
    <>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Projects</h1>
          <p className="text-sm text-muted-foreground">{org.name}</p>
        </div>
        <Link
          href={`/${orgSlug}/projects/new`}
          className={buttonVariants()}
        >
          New project
        </Link>
      </div>

      {!projects || projects.length === 0 ? (
        <p className="mt-8 text-muted-foreground">
          No projects yet. Create your first one to get started.
        </p>
      ) : (
        <ul className="mt-6 flex flex-col gap-3">
          {projects.map((project) => (
            <li key={project.id}>
              <Card className="shadow-sm transition-shadow hover:shadow-md">
                <CardContent className="flex items-center justify-between py-4">
                  <div className="flex flex-col">
                    <Link
  className="font-medium underline"
  href={`/${orgSlug}/projects/${project.id}`}
>
  {project.name}
</Link>
                    <span className="text-sm text-muted-foreground">
                      {clientNames.get(project.client_id) ?? "Unknown client"}
                    </span>
                  </div>
                  <StatusBadge status={project.status} />
                </CardContent>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

export default function ProjectsPage({ params }: { params: Params }) {
  return (
    <main className="mx-auto max-w-2xl p-6">
      <Suspense fallback={<div className="h-24" />}>
        <ProjectsList params={params} />
      </Suspense>
    </main>
  );
}