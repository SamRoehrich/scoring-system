import express from "express";
import http from "http";
import { Server } from "ws";
import { createClient, RedisClient } from 'redis'

interface Time {
  minutes: number
  seconds: number
}

(async () => {
  
  const app = express();
  const server = http.createServer(app);
  const wss = new Server({ server });
  const redisClient = createClient();
  
  // check if there is an error connection to the redis client
  redisClient.on("error", function(error) {
    console.log(error)
  })

  const tick = (time: Time, publisher: RedisClient) => {
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
    publisher.publish("scoring:timer", `${newTime.minutes}: ${newTime.seconds}`)
    // let ticker = setInterval(tick(newTime, publisher), 1000)
    // publisher.on("message", function(_chanel, message) {
    //   if(message === "STOP") {
    //     clearInterval(ticker)
    //   }
    // })
    return ''
  }
  
  function startTimer() {
    const publisher = createClient()
    publisher.publish("scoring:events", "START")
    let time = { 
      minutes: 4,
      seconds: 0
    }
    tick(time, publisher)
  }

  
  wss.on("connection", function connection(ws) {
    console.log("Client connected")
    // on websocket connection, sub to scoring chanels
    redisClient.subscribe("scoring:timer")
    redisClient.subscribe("scoring:events")

    // on chanel message, send message over websocket
    redisClient.on("message", function(_chanel, message) {
      ws.send(message)
    })

    // on message sent over websockets
    ws.on("message", function incoming(message) {
      // if message is the START command start the timer
      if(message === "START") {
        startTimer()
      }
      wss.clients.forEach(function each(client) {
        if(client.readyState === ws.OPEN) {
          client.send(message)
        }
      })
    });
  });
  server.listen(8080);
})();
