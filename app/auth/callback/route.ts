import { NextResponse } from "next/server";

import { createClient } from "../../lib/supabase/server";

export const dynamic = "force-dynamic";

/*
  Handles the OAuth / magic link / email confirmation / password
  recovery redirects. With PKCE flow every callback carries a `code`
  plus a `type` hint:
    - oauth        → continue to `next`
    - magiclink    → continue to `next`
    - signup       → continue to `next`
    - recovery     → send the user to the reset-password page
*/
export async function GET(request: Request) {
  const { searchParams, origin } =
    new URL(request.url);

  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/settings";
  const type = searchParams.get("type");

  if (code) {
    const supabase = await createClient();

    const { error } =
      await supabase.auth.exchangeCodeForSession(
        code,
      );

    if (!error) {
      if (type === "recovery") {
        return NextResponse.redirect(
          `${origin}/reset-password`,
        );
      }

      const forwardedHost =
        request.headers.get("x-forwarded-host");

      const isLocalEnv =
        process.env.NODE_ENV === "development";

      if (isLocalEnv) {
        return NextResponse.redirect(
          `${origin}${next}`,
        );
      }

      if (forwardedHost) {
        return NextResponse.redirect(
          `https://${forwardedHost}${next}`,
        );
      }

      return NextResponse.redirect(
        `${origin}${next}`,
      );
    }
  }

  return NextResponse.redirect(
    `${origin}/login?error=auth`,
  );
}