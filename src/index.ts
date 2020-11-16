import "reflect-metadata";
import { createConnection, getConnectionOptions } from "typeorm";
import express from "express";
import http from "http";
import { Server } from "ws";
import cors from "cors";
import { createClient } from "async-redis";
import startTimer from "../timer/StartTimer";

process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = "0";

(async () => {
  // initialize servers
  const app = express();
  const server = http.createServer(app);
  const wss = new Server({ server });
  const EventRoutes = require("../routes/Event.ts");
  const AdminRoutes = require("../routes/Admin.ts");

  // get database connection options
  const dbConnectionOptions = await getConnectionOptions(process.env.NODE_ENV);

  // connect to database
  await createConnection({ ...dbConnectionOptions });

  // init redis client
  const redisClient = createClient();

  // check if there is an error connection to the redis client
  redisClient.on("error", function(error) {
    console.log(error);
  });

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
        startTimer(redisClient);
      }
      // if STOP, stop the timer
      if (message === "STOP") {
        redisClient.set("timer:stop", "STOP");
      }
    });
  });

  // app midlleware
  app.use(cors());
  app.use(express.json());

  // base API routes
  app.use("/event", EventRoutes);
  app.use("/admin", AdminRoutes);

  // http server
  app.listen(5000, () => {
    console.log("HTTP server started");
  });

  // start WS server on port 8080
  server.listen(8080);
})();
