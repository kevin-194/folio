"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";

const schema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(60, "Name must be 60 characters or fewer"),
  slug: z
    .string()
    .trim()
    .min(3, "URL must be at least 3 characters")
    .max(40, "URL must be 40 characters or fewer")
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "URL can only use lowercase letters, numbers, and single hyphens"
    ),
});

export async function createOrganization(formData: FormData) {
  const parsed = schema.safeParse({
    name: formData.get("name"),
    slug: formData.get("slug"),
  });

  if (!parsed.success) {
    redirect(
      `/orgs/new?error=${encodeURIComponent(parsed.error.issues[0].message)}`
    );
  }

  const supabase = await createServerSupabaseClient();

  const { error } = await supabase.rpc("create_organization", {
    org_name: parsed.data.name,
    org_slug: parsed.data.slug,
  });

  if (error) {
    // 23505 is Postgres's "unique violation" code: the slug already exists
    const message =
      error.code === "23505" ? "That URL is already taken" : error.message;
    redirect(`/orgs/new?error=${encodeURIComponent(message)}`);
  }

  revalidatePath("/", "layout");
  redirect(`/${parsed.data.slug}`);
}