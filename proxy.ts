import type { NextRequest } from "next/server";

import { updateSession } from "./app/lib/supabase/middleware";

/*
  Next.js 16 renamed the `middleware` file convention to `proxy`.
  This runs on every navigation to refresh the Supabase session
  and protect authenticated pages.
*/
export async function proxy(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: [
    /*
      Refresh the session on all routes except static assets.
      API routes are included so their auth checks see a valid
      session token.
    */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|pdf)$).*)",
  ],
};