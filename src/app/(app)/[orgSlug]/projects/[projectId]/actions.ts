"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";

const addSchema = z.object({
  orgSlug: z.string().min(1),
  projectId: z.string().uuid(),
  title: z
    .string()
    .trim()
    .min(2, "Title must be at least 2 characters")
    .max(120, "Title must be 120 characters or fewer"),
  dueDate: z.union([
    z.literal(""),
    z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Enter a valid date"),
  ]),
});

export async function addMilestone(formData: FormData) {
  const orgSlug = String(formData.get("orgSlug") ?? "");
  const projectId = String(formData.get("projectId") ?? "");
  const pageUrl = `/${encodeURIComponent(orgSlug)}/projects/${encodeURIComponent(projectId)}`;

  const parsed = addSchema.safeParse({
    orgSlug,
    projectId,
    title: formData.get("title"),
    dueDate: String(formData.get("dueDate") ?? ""),
  });

  if (!parsed.success) {
    redirect(
      `${pageUrl}?error=${encodeURIComponent(parsed.error.issues[0].message)}`
    );
  }

  const supabase = await createServerSupabaseClient();

  const { data: org } = await supabase
    .from("organizations")
    .select("id")
    .eq("slug", parsed.data.orgSlug)
    .maybeSingle();

  if (!org) redirect("/");

  const { error } = await supabase.from("milestones").insert({
    org_id: org.id,
    project_id: parsed.data.projectId,
    title: parsed.data.title,
    due_date: parsed.data.dueDate || null,
  });

  if (error) {
    const message =
      error.code === "23503"
        ? "That project doesn't belong to this organization"
        : error.message;
    redirect(`${pageUrl}?error=${encodeURIComponent(message)}`);
  }

  revalidatePath(pageUrl);
  redirect(pageUrl);
}

const toggleSchema = z.object({
  orgSlug: z.string().min(1),
  projectId: z.string().uuid(),
  milestoneId: z.string().uuid(),
  done: z.enum(["true", "false"]),
});

export async function toggleMilestone(formData: FormData) {
  const parsed = toggleSchema.safeParse({
    orgSlug: String(formData.get("orgSlug") ?? ""),
    projectId: String(formData.get("projectId") ?? ""),
    milestoneId: String(formData.get("milestoneId") ?? ""),
    done: String(formData.get("done") ?? ""),
  });

  if (!parsed.success) redirect("/");

  const pageUrl = `/${encodeURIComponent(parsed.data.orgSlug)}/projects/${parsed.data.projectId}`;
  const supabase = await createServerSupabaseClient();

  // RLS decides whether this user may update this milestone
  const { error } = await supabase
    .from("milestones")
    .update({ is_done: parsed.data.done === "true" })
    .eq("id", parsed.data.milestoneId);

  if (error) {
    redirect(`${pageUrl}?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath(pageUrl);
  redirect(pageUrl);
}