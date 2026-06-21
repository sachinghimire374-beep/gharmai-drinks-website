import { prisma } from "./prisma";

// Record an admin action in the audit log.
export async function logActivity(params: {
  adminId?: string;
  action: "CREATE" | "UPDATE" | "DELETE" | "LOGIN" | "STATUS";
  entity: string;
  entityId?: string;
  detail?: string;
}) {
  try {
    await prisma.activityLog.create({ data: params });
  } catch {
    // never block the main action on a log failure
  }
}
