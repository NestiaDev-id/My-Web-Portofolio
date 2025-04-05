import { getToken } from "next-auth/jwt";
import {
  NextFetchEvent,
  NextMiddleware,
  NextRequest,
  NextResponse,
} from "next/server";

const onlyAdmin = ["/admin"];

export default function withAuth(
  middleware: NextMiddleware,
  requireAuth: String[] = []
) {
  return async (req: NextRequest, next: NextFetchEvent) => {
    const pathName = req.nextUrl.pathname;
    if (requireAuth.includes(pathName)) {
      const token = await getToken({
        req,
        secret: process.env.NEXTAUTH_SECRET,
      });
      if (!token) {
        const url = new URL("/auth/login", req.url);
        url.searchParams.set("callbackUrl", encodeURI(req.url));
        return NextResponse.redirect(url);
      }
      if (token.role !== "admin" && onlyAdmin.includes(pathName)) {
        return NextResponse.redirect(new URL("/", req.url));
      }
    }
    return middleware(req, next);
  };
}
