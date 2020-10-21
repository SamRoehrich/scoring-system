import "reflect-metadata";
import { createConnection, getConnectionOptions } from "typeorm";
import express from "express";
import http from "http";
import { Server } from "ws";
import cors from "cors";
import { createClient } from "async-redis";
import startTimer from "../timer/StartTimer";

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
  process.env.NODE_ENV === "production"
    ? await createConnection({
        ...dbConnectionOptions,
        url:
          "    postgres://bydcbomtpeaxwv:0333b5862167ec84cb4021789ec1af56af63fe4da3d643beffe22839623f37ef@ec2-54-157-4-216.compute-1.amazonaws.com:5432/dflebeal1odq7i",
        name: "default",
        extra: {
          ssl: {
            rejeectUnauthorized: true,
          },
        },
      } as any)
    : await createConnection();

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

  app.use(cors());
  app.use(express.json());

  app.use("/event", EventRoutes);
  app.use("/admin", AdminRoutes);

  app.listen(5000, () => {
    console.log("HTTP server starts");
  });
  // start server on port 8080
  server.listen(8080);
})();
