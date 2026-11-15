"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";

const schema = z.object({
  orgSlug: z.string().min(1),
  clientId: z.string().uuid("Choose a client"),
  name: z
    .string()
    .trim()
    .min(2, "Project name must be at least 2 characters")
    .max(100, "Project name must be 100 characters or fewer"),
});

export async function addProject(formData: FormData) {
  const orgSlug = String(formData.get("orgSlug") ?? "");
  const formUrl = `/${encodeURIComponent(orgSlug)}/projects/new`;

  const parsed = schema.safeParse({
    orgSlug,
    clientId: String(formData.get("clientId") ?? ""),
    name: formData.get("name"),
  });

  if (!parsed.success) {
    redirect(
      `${formUrl}?error=${encodeURIComponent(parsed.error.issues[0].message)}`
    );
  }

  const supabase = await createServerSupabaseClient();

  // Look up the organization ourselves. RLS only returns it to members.
  const { data: org } = await supabase
    .from("organizations")
    .select("id")
    .eq("slug", parsed.data.orgSlug)
    .maybeSingle();

  if (!org) redirect("/");

  const { error } = await supabase.from("projects").insert({
    org_id: org.id,
    client_id: parsed.data.clientId,
    name: parsed.data.name,
  });

  if (error) {
    // 23503 = foreign key violation: the client isn't in this organization
    const message =
      error.code === "23503"
        ? "That client doesn't belong to this organization"
        : error.message;
    redirect(`${formUrl}?error=${encodeURIComponent(message)}`);
  }

  revalidatePath(`/${parsed.data.orgSlug}/projects`);
  redirect(`/${parsed.data.orgSlug}/projects`);
}