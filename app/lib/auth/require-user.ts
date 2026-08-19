import "server-only";

import { redirect } from "next/navigation";
import type { SupabaseClient } from "@supabase/supabase-js";

import { createClient as createSupabaseClient } from "../supabase/server";

export type AuthenticatedContext = {
  supabase: SupabaseClient;
  user: {
    id: string;
    email: string | null;
    emailVerified: boolean;
    createdAt: string | null;
    fullName: string | null;
    avatarUrl: string | null;
  };
};

/*
  For server components / server actions. Redirects unauthenticated
  users to the login page.
*/
export async function requireUser(): Promise<AuthenticatedContext> {
  const supabase = await createSupabaseClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirect("/login?next=/settings");
  }

  return {
    supabase,
    user: {
      id: user.id,
      email: user.email ?? null,
      emailVerified:
        Boolean(user.email_confirmed_at) ||
        Boolean(user.phone_confirmed_at),
      createdAt:
        user.created_at ?? null,
      fullName:
        (user.user_metadata?.full_name as string | undefined) ??
        (user.user_metadata?.name as string | undefined) ??
        null,
      avatarUrl:
        (user.user_metadata?.avatar_url as string | undefined) ??
        null,
    },
  };
}