import { NextResponse, type NextRequest } from "next/server";

const PLATFORM_DOMAINS = ["createrhub.in", "www.createrhub.in", "localhost"];
const PLATFORM_PORT = "3000";

export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  const hostname = request.headers.get("host") ?? "";

  // Strip port for comparison
  const hostWithoutPort = hostname.split(":")[0];

  // Platform domains — serve as-is
  if (PLATFORM_DOMAINS.includes(hostWithoutPort)) {
    return NextResponse.next();
  }

  // *.createrhub.in subdomain → rewrite to /creator/[slug]
  const subdomainMatch = hostWithoutPort.match(/^(.+)\.createrhub\.in$/);
  if (subdomainMatch) {
    const slug = subdomainMatch[1];
    // Skip non-creator subdomains (api, www, etc.)
    if (["api", "www", "app"].includes(slug)) {
      return NextResponse.next();
    }
    url.pathname = `/creator/${slug}${url.pathname === "/" ? "" : url.pathname}`;
    return NextResponse.rewrite(url);
  }

  // Custom domain → rewrite to /creator/[slug] via API lookup
  // The actual slug lookup is done server-side in the /creator/[slug] page
  // We use a header to signal this is a custom domain request
  const response = NextResponse.rewrite(
    new URL(`/creator/__custom_domain${url.pathname}`, request.url)
  );
  response.headers.set("x-custom-domain", hostWithoutPort);
  return response;
}

export const config = {
  matcher: [
    // Skip Next.js internals and static files
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|woff|woff2)).*)",
  ],
};
