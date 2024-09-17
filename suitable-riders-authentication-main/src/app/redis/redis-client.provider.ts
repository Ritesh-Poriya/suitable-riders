import Redis from 'ioredis';
import { RedisModuleOptions } from './redis.interface';
export class RedisClientError extends Error {}

export async function getClient(
  options: RedisModuleOptions,
): Promise<Redis.Redis> {
  const { onClientReady, url, ...opt } = options;
  const client = url ? new Redis(url) : new Redis(opt);
  if (onClientReady) {
    onClientReady(client);
  }
  return client;
}
