import { NextResponse, type NextRequest } from "next/server";

/**
 * Comprobación optimista: sin cookie de acceso no se renderiza nada de la app.
 * La validación real (firma, caducidad, versión de contraseña, PIN) ocurre en
 * el servidor en cada página y server action.
 */
const PUBLIC_PATHS = ["/acceso", "/offline"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`))) return NextResponse.next();
  if (!request.cookies.has("fs_access")) {
    const url = request.nextUrl.clone();
    url.pathname = "/acceso";
    url.search = "";
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/|pwa-icon/|icon.svg|apple-icon|manifest.webmanifest|sw.js|favicon.ico|robots.txt).*)"],
};
