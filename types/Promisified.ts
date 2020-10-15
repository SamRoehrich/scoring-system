import { Commands, RedisClient } from "redis";

type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;

type Omitted = Omit<RedisClient, keyof Commands<boolean>>;

interface Promisified<T = RedisClient>
  extends Omitted,
    Commands<Promise<boolean>> {}

export = Promisified;
