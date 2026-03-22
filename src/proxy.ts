import { NextResponse, type NextRequest } from "next/server"
import { updateSession } from "@/lib/supabase/proxy"
import { createClient } from "@/lib/supabase/server"

export async function proxy(request: NextRequest) {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  if (request.nextUrl.pathname.startsWith('/login')) {
    return await updateSession(request)
  }
  if (!data) {
    const url = request.nextUrl.clone();
    url.pathname = '/login'
    return NextResponse.redirect(url);
  }
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