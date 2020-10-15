import Promisified from "../types/Promisified";
import { RedisClient } from "redis";

import tick from "./Tick";

async function startTimer(rc: Promisified<RedisClient>) {
  // publish to events chanel that the round has started
  rc.publish("scoring:events", "START");
  // init timer
  await rc.set("timer:minutes", "4");
  await rc.set("timer:seconds", "0");
  // start timer
  await tick(rc);
}

export default startTimer;
