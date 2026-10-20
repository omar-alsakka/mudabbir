import { prisma } from "@/lib/prisma";

interface AuditLogParams {
  userId: string;
  action: "CREATE" | "UPDATE" | "DELETE";
  entityType: string;
  entityId: string;
  oldValue?: Record<string, unknown> | null;
  newValue?: Record<string, unknown> | null;
  ipAddress?: string;
}

export async function createAuditLog(params: AuditLogParams) {
  // The cast keeps this module independent of generated Prisma namespace
  // types, which may be absent in CI environments before `prisma generate`
  // has run (e.g. Vercel cold builds).
  await prisma.auditLog.create({ data: params as never });
}
