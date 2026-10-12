import { prisma } from "@/lib/prisma";

/** First public order number: AHD-2026-001555 */
export const ORDER_SEQ_START = 1555;

export function formatOrderNumber(year: number, seq: number): string {
  return `AHD-${year}-${String(seq).padStart(6, "0")}`;
}

/**
 * Atomically allocate the next AHD-YYYY-NNNNNN order number.
 * Starts at 001555 for 2026 (and each new year starts at 000001 unless counter exists).
 */
export async function allocateOrderNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const key = `orderSeq:${year}`;

  return prisma.$transaction(async (tx) => {
    // Serialize concurrent checkouts
    await tx.$executeRawUnsafe(
      `SELECT pg_advisory_xact_lock(hashtext($1))`,
      key
    );

    const row = await tx.siteSetting.findUnique({ where: { key } });
    let next: number;
    if (row?.value && /^\d+$/.test(row.value.trim())) {
      next = Number(row.value.trim()) + 1;
    } else if (year === 2026) {
      next = ORDER_SEQ_START;
    } else {
      next = 1;
    }

    await tx.siteSetting.upsert({
      where: { key },
      create: { key, value: String(next) },
      update: { value: String(next) },
    });

    return formatOrderNumber(year, next);
  });
}

export function displayOrderRef(order: {
  id: string;
  orderNumber?: string | null;
}): string {
  return order.orderNumber || order.id;
}
