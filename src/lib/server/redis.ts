import { Redis } from "@upstash/redis";

/**
 * One Redis client for the rewards server code.
 * - Real: KV_REST_API_URL + KV_REST_API_TOKEN (Vercel Marketplace > Upstash Redis) or the UPSTASH_REDIS_REST_* pair.
 * - Local `next dev` with no Redis set: a small in-memory stand-in with the same calls, so the rewards flow can be
 *   tried on a laptop. It forgets everything on restart. It is never used in production.
 */
type Entry = { v: unknown; exp?: number };

class MemoryRedis {
  private m = new Map<string, Entry>();
  private live(k: string) {
    const e = this.m.get(k);
    if (e?.exp && e.exp < Date.now()) {
      this.m.delete(k);
      return undefined;
    }
    return e;
  }
  async get<T>(k: string) {
    return (this.live(k)?.v ?? null) as T | null;
  }
  async set(k: string, v: unknown, o?: { nx?: boolean; ex?: number }) {
    if (o?.nx && this.live(k)) return null;
    this.m.set(k, { v: JSON.parse(JSON.stringify(v)), exp: o?.ex ? Date.now() + o.ex * 1000 : undefined });
    return "OK";
  }
  async getdel<T>(k: string) {
    const v = await this.get<T>(k);
    this.m.delete(k);
    return v;
  }
  async del(k: string) {
    return this.m.delete(k) ? 1 : 0;
  }
  async incrby(k: string, n: number) {
    const next = (Number(this.live(k)?.v ?? 0) || 0) + n;
    this.m.set(k, { v: next });
    return next;
  }
  async incr(k: string) {
    return this.incrby(k, 1);
  }
}

export type Db = Redis | MemoryRedis;

const g = globalThis as unknown as { __ahDb?: Db | null };

export function db(): Db | null {
  if (g.__ahDb !== undefined) return g.__ahDb;
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
  g.__ahDb = url && token ? new Redis({ url, token }) : process.env.NODE_ENV !== "production" ? new MemoryRedis() : null;
  return g.__ahDb;
}
