import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

type AuditLogData = Prisma.AuditLogUncheckedCreateInput;

export async function createAuditLog(params: AuditLogData) {
  await prisma.auditLog.create({ data: params });
}
