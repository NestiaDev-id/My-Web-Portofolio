import {
  NextFetchEvent,
  NextMiddleware,
  NextRequest,
  NextResponse,
} from "next/server";

// Middleware wrapper untuk melindungi rute tertentu
export default function withAuth(
  middleware: NextMiddleware,
  requireAuth: string[] = []
) {
  return async (req: NextRequest, event: NextFetchEvent) => {
    const pathName = req.nextUrl.pathname;

    if (requireAuth.includes(pathName)) {
      const tokenString = req.cookies.get("token")?.value;
      if (!tokenString) {
        const loginUrl = new URL("/auth/login", req.url);
        loginUrl.searchParams.set("callbackUrl", encodeURI(req.url));
        return NextResponse.redirect(loginUrl);
      }
    }
    return middleware(req, event);
  };
}
