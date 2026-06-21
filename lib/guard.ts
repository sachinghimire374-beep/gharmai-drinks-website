import { getServerSession } from "next-auth";
import { authOptions, canAccess, type Role } from "./auth";

// Server-side guard for API routes. Returns the session or throws a Response.
export async function requireAdmin(section?: Parameters<typeof canAccess>[1]) {
  const session = await getServerSession(authOptions);
  const role = (session?.user as any)?.role as Role | undefined;
  if (!session || !role) {
    throw new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }
  if (section && !canAccess(role, section)) {
    throw new Response(JSON.stringify({ error: "Forbidden" }), { status: 403 });
  }
  return { session, role, adminId: (session.user as any).id as string };
}
