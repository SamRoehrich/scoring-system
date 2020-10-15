import { RedisClient } from "redis";
import Promisified from "../types/Promisified";

import timerReset from "./TimerReset";

async function tick(rc: Promisified<RedisClient>) {
  let minutes: any = await rc.get("timer:minutes");
  let seconds: any = await rc.get("timer:seconds");
  let STOP: any = await rc.get("timer:stop");
  if (STOP === "STOP") {
    // stop timer and exit loop
    return "";
  } else {
    // publish time to scoring chanel
    rc.publish("scoring:timer", `${minutes}: ${seconds}`);
    // increment time
    if (seconds === "0") {
      if (minutes === "0") {
        await timerReset(rc);
      }
      if (minutes > 0) {
        await rc.set("timer:minutes", String(parseInt(minutes) - 1));
        await rc.set("timer:seconds", "59");
      }
    } else {
      await rc.set("timer:seconds", String(seconds - 1));
    }
    // wait one second and repeat
    setTimeout(() => tick(rc), 1000);
    // necessary to not throw a type error
    return "";
  }
}

export = tick;
