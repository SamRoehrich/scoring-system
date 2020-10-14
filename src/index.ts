import express from "express";
import http from "http";
import { Server } from "ws";
import { createClient } from 'redis'

interface Time {
  minutes: number
  seconds: number
}

(async () => {

  const app = express();
  const server = http.createServer(app);
  const wss = new Server({ server });
  const redisClient = createClient();

  const tick = (time: Time) => {
    let newTime: Time = { minutes: 0, seconds: 0}
    if(time.seconds === 0) {
      if(time.minutes === 0) {
        newTime = {minutes: 4, seconds: 0}
      } else {
        newTime = {minutes: time.minutes - 1, seconds: 59}
      }
    } else {
      newTime = {...time, seconds: time.seconds - 1}
    }
    redisClient.publish("scoring:timer", `${time.minutes}: ${time.seconds}`)
    let ticker = setInterval(tick(newTime), 1000)
    redisClient.on("message", function(_chanel, message) {
      if(message === "STOP") {
        clearInterval(ticker)
      }
    })
    return ""
  }

  function startTimer() {
    redisClient.subscribe("scoring:events")
    redisClient.publish("scoring:events", "START")
    let time = { 
      minutes: 4,
      seconds: 0
    }

    tick(time)
  }

  redisClient.on("error", function(error) {
    console.log(error)
  })

  
  wss.on("connection", function connection(ws) {
    redisClient.subscribe("scoring:timer")
    redisClient.subscribe("scoring:events")
    redisClient.on("message", function(_chanel, message) {
      ws.send(message)
    })
    ws.on("message", function incoming(message) {
      if(message === "START") {
        startTimer()
      }
      wss.clients.forEach(function each(client) {
        if(client.readyState === ws.OPEN) {
          client.send(message)
        }
      })
    });
    ws.send("something");
  });
  server.listen(8080);
})();
