import { DataSource, QueryRunner } from "typeorm";

export async function withTransaction<T>(ds: DataSource, fn: (qr: QueryRunner) => Promise<T>): Promise<T> {
  const qr = ds.createQueryRunner();
  await qr.connect();
  await qr.startTransaction();
  try {
    const result = await fn(qr);
    await qr.commitTransaction();
    return result;
  } catch (err) {
    try { await qr.rollbackTransaction(); } catch {}
    throw err;
  } finally {
    await qr.release();
  }
}

