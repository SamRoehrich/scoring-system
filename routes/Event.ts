import { Request, Response, Router } from "express";
import { Event } from "../entities/Event";
import { EventManager } from "../entities/EventManager";

const router = Router();

router.post("/create", async function(req: Request, res: Response) {
  console.log(req.body);
  const {
    eventName,
    eventLocation,
    eventDate,
    rcEmail,
    numBoulders,
    scorekeeperCode,
    adminCode,
  } = req.body;
  const rc = await EventManager.findOne({ where: { email: rcEmail } });
  if (rc === null) {
    res.send("You are not authorized in the system to create an event");
    res.sendStatus(500);
  }
  const newEvent = await Event.create({
    eventName,
    eventDate,
    eventLocation,
    adminCode,
    scorekeeperCode,
    numBoulders,
    managerID: rc,
  }).save();
  if (newEvent !== null) {
    res.send({ eventId: newEvent.eventID });
    res.sendStatus(200);
  } else {
    res.send(
      "There was an error creating the event, contact customer support."
    );
  }
});

router.get("/all", async (_req, res) => {
  const events = await Event.find({});
  res.send(JSON.stringify(events));
});

router.get("/findByRcId", async (req, res) => {
  const { rcID } = req.body;
  const event = await Event.findOne({ where: { managerID: rcID } });
  res.send(event);
});

module.exports = router;
