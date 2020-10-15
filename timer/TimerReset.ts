import { RedisClient } from "redis";
import Promisified from "../types/Promisified";

async function timerReset(rc: Promisified<RedisClient>) {
  await rc.set("timer:minutes", "4");
  await rc.set("timer:seconds", "0");
}

export default timerReset;
