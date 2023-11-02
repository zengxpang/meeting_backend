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

  // 在哈希表（Hash）相关的方法中，field这是哈希表中的字段名称。
  //设置key中filed字段的数据value
  async setHashField(
    key: string,
    field: string,
    value: any,
    ttl: number = 5 * 60,
  ) {
    await this.redisClient.hSet(key, field, value);
    if (ttl) {
      await this.redisClient.expire(key, ttl);
    }
  }

  //获取key中的field字段数据
  async getHashField(key: string, field: string) {
    return await this.redisClient.hGet(key, field);
  }

  //获取key中所有数据
  async getAllHashFields(key: string) {
    return await this.redisClient.hGetAll(key);
  }
}
