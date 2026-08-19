import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import {
  getSupabasePublishableKey,
  getSupabaseUrl,
} from "./env";

/*
  Session refresh helper for the proxy (middleware). Refreshes the
  Supabase session on every navigation and returns the (possibly
  updated) response.
*/
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    getSupabaseUrl(),
    getSupabasePublishableKey(),
    {
      auth: {
        flowType: "pkce",
      },
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet, headers) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );

          supabaseResponse = NextResponse.next({ request });

          cookiesToSet.forEach(({ name, value, options }) => {
            supabaseResponse.cookies.set(name, value, options);
          });

          Object.entries(headers).forEach(([key, value]) => {
            supabaseResponse.headers.set(key, value);
          });
        },
      },
    },
  );

  // IMPORTANT: do not run any code between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard
  // to debug authentication issues and change the behavior of Next.js.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  const isProtectedPage =
    pathname === "/mindmap" ||
    pathname.startsWith("/mindmap/") ||
    pathname === "/explore" ||
    pathname.startsWith("/explore/") ||
    pathname === "/settings" ||
    pathname.startsWith("/settings/");

  const isAuthPage =
    pathname === "/login" ||
    pathname === "/signup";

  if (!user && isProtectedPage) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  // /reset-password is intentionally NOT an auth page: the recovery
  // flow redirects the freshly authenticated user there.
  if (user && isAuthPage) {
    return NextResponse.redirect(
      new URL("/settings", request.url),
    );
  }

  return supabaseResponse;
}