import { NextResponse, type NextRequest } from "next/server"
import { updateSession } from "@/lib/supabase/proxy"
import { createClient } from "@/lib/supabase/server"

export async function proxy(request: NextRequest) {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  // Get hostname and pathname
  const hostname = request.headers.get('host');
  const pathname = request.nextUrl.pathname;
  // If we are coming from main page (localhost:3001, plurally main domain...)
  // then stay as is.
  if (process.env.NEXT_PUBLIC_SITE_URL?.match(hostname!)) {
    // Do nothing, continue
  } else { // Otherwise redirect to /fronters
    return NextResponse.rewrite(new URL(`/fronters${pathname}`, request.url));
  }
  // If in login or fronters, just update session
  if (pathname.startsWith('/login') || pathname.startsWith('/fronters')) {
    return await updateSession(request)
  }
  // If not logged in, redirect to /login
  if (!data) {
    const url = request.nextUrl.clone();
    url.pathname = '/login'
    return NextResponse.redirect(url);
  }
  // Update session
  return await updateSession(request)
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - manifest.json, manifest.webmanifest (PWA manifest files)
     * Feel free to modify this pattern to include more paths.
     */
    "/((?!_next/static|_next/image|favicon.ico|manifest.json|manifest.webmanifest|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}