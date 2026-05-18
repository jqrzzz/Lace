// Edge-level auth gate for /admin/*.
//
// Defense-in-depth: the admin layout (server component) also validates
// the actor against lace.app_users. This middleware short-circuits
// unauthenticated requests before any server work runs, so an anon
// curl gets a redirect immediately instead of hitting the database.
//
// Note: the middleware does NOT check role. Owner/staff/viewer
// distinction lives in the layout. Here we just confirm a valid
// Supabase auth session exists.

import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function middleware(req: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  // No Supabase env? Let the request through — the layout will fall
  // back to the demo actor in zero-config dev.
  if (!url || !anon) return NextResponse.next();

  // Build a response we can mutate (Supabase may want to refresh the
  // token cookie on its way through).
  const response = NextResponse.next({ request: req });
  const supabase = createServerClient(url, anon, {
    cookies: {
      getAll() {
        return req.cookies.getAll().map((c) => ({
          name: c.name,
          value: c.value,
        }));
      },
      setAll(cookies) {
        cookies.forEach(({ name, value, options }) => {
          response.cookies.set({ name, value, ...options });
        });
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    const redirect = req.nextUrl.clone();
    redirect.pathname = "/login";
    redirect.searchParams.set(
      "next",
      req.nextUrl.pathname + req.nextUrl.search,
    );
    return NextResponse.redirect(redirect);
  }
  return response;
}

export const config = {
  // Only /admin/* — public storefront and customer /account stay open.
  matcher: ["/admin/:path*"],
};
