import express from "express";
import http from "http";
import { Server } from "ws";
import { createClient } from "async-redis";

(async () => {
  const app = express();
  const server = http.createServer(app);
  const wss = new Server({ server });
  const redisClient = createClient();
  const publisher = createClient();

  // check if there is an error connection to the redis client
  redisClient.on("error", function(error) {
    console.log(error);
  });

  async function startTimer() {
    publisher.publish("scoring:events", "START");
    await publisher.set("timer:minutes", "4");
    await publisher.set("timer:seconds", "0");
    tick();
  }

  async function tick() {
    let minutes: any = await redisClient.get("timer:minutes");
    let seconds: any = await redisClient.get("timer:seconds");
    publisher.publish("scoring:timer", `${minutes}: ${seconds}`);
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
    setTimeout(tick, 1000);
    return "";
  }

  async function timerReset() {
    await redisClient.set("timer:minutes", "4");
    await redisClient.set("timer:seconds", "0");
  }

  wss.on("connection", function connection(ws) {
    console.log("Client connected");
    // on websocket connection, sub to scoring chanels
    const sub = createClient();
    sub.subscribe("scoring:timer");
    // on chanel message, send message over websocket
    sub.on("message", function(_chanel, message) {
      ws.send(message);
    });

    // on message sent over websockets
    ws.on("message", function incoming(message) {
      // if message is the START command start the timer
      if (message === "START") {
        startTimer();
      }
    });
  });
  server.listen(8080);
})();
