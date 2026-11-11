"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";

const schema = z.object({
  orgSlug: z.string().min(1),
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(80, "Name must be 80 characters or fewer"),
  email: z.union([
    z.literal(""),
    z.string().trim().email("Enter a valid email address"),
  ]),
});

export async function addClient(formData: FormData) {
  const orgSlug = String(formData.get("orgSlug") ?? "");
  const formUrl = `/${encodeURIComponent(orgSlug)}/clients/new`;

  const parsed = schema.safeParse({
    orgSlug,
    name: formData.get("name"),
    email: formData.get("email") ?? "",
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

  const { error } = await supabase.from("clients").insert({
    org_id: org.id,
    name: parsed.data.name,
    email: parsed.data.email || null,
  });

  if (error) {
    redirect(`${formUrl}?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath(`/${parsed.data.orgSlug}/clients`);
  redirect(`/${parsed.data.orgSlug}/clients`);
}