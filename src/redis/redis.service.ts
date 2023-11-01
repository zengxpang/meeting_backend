import { Inject, Injectable } from '@nestjs/common';
import { RedisClientType } from 'redis';

@Injectable()
export class RedisService {
  @Inject('REDIS_CLIENT')
  private readonly redisClient: RedisClientType;

  async get(key: string) {
    return await this.redisClient.get(key);
  }

  async set(key: string, value: string | number, ttl?: number) {
    await this.redisClient.set(key, value);
    if (ttl) {
      await this.redisClient.expire(key, ttl);
    }
  }

  async hGetAll(key: string): Promise<any> {
    return await this.redisClient.hGetAll(key);
  }

  async hSet(key: string, value: any, ttl: number = 5 * 60) {
    await this.redisClient.hSet(key, value);
    if (ttl) {
      await this.redisClient.expire(key, ttl);
    }
  }
}
