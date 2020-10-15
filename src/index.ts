import express from "express";
import http from "http";
import { Server } from "ws";
import { createClient } from "async-redis";

(async () => {
  // initialize servers
  const app = express();
  const server = http.createServer(app);
  const wss = new Server({ server });
  const redisClient = createClient(); // general purpose client
  const publisher = createClient(); // this only makes SET requests to the redis server

  // check if there is an error connection to the redis client
  redisClient.on("error", function(error) {
    console.log(error);
  });

  async function startTimer() {
    // publish to events chanel that the round has started
    publisher.publish("scoring:events", "START");
    // init timer
    await publisher.set("timer:minutes", "4");
    await publisher.set("timer:seconds", "0");
    // start timer
    tick();
  }

  async function tick() {
    let minutes: any = await redisClient.get("timer:minutes");
    let seconds: any = await redisClient.get("timer:seconds");
    let STOP: any = await redisClient.get("timer:stop");
    if (STOP === "STOP") {
      // stop timer and exit loop
      return "";
    } else {
      // publish time to scoring chanel
      publisher.publish("scoring:timer", `${minutes}: ${seconds}`);
      // increment time
      if (seconds === "0") {
        if (minutes === "0") {
          await timerReset();
        }
        if (minutes > 0) {
          await redisClient.set("timer:minutes", String(parseInt(minutes) - 1));
          await redisClient.set("timer:seconds", "59");
        }
      } else {
        await redisClient.set("timer:seconds", String(seconds - 1));
      }
      // wait one second and repeat
      setTimeout(tick, 1000);
      // necessary to not throw a type error
      return "";
    }
  }

  async function timerReset() {
    await redisClient.set("timer:minutes", "4");
    await redisClient.set("timer:seconds", "0");
  }

  wss.on("connection", function connection(ws) {
    console.log("Client connected");
    // for each ws connection you need to make a new redis client and sub to the timer chanel
    const sub = createClient();
    sub.subscribe("scoring:timer");
    // on 'scoring:timer' message, send message over websocket
    sub.on("message", function(_chanel, message) {
      ws.send(message);
    });

    // on message sent over websockets
    ws.on("message", function incoming(message) {
      // if message is START, start the timer
      if (message === "START") {
        startTimer();
      }
      // if STOP, stop the timer
      if (message === "STOP") {
        redisClient.set("timer:stop", "STOP");
      }
    });
  });
  // start server on port 8080
  server.listen(8080);
})();
