import { Request, Response, Router } from "express";
import { Event } from "../entities/Event";
import { EventManager } from "../entities/EventManager";
import { Climber } from "../entities/Climber";

const router = Router();

// create event
router.post("/create", async function(req: Request, res: Response) {
  console.log(req.body);
  // pull data from http request
  const {
    eventName,
    eventLocation,
    eventDate,
    rcEmail,
    numBoulders,
    scorekeeperCode,
    adminCode,
  } = req.body;
  // find manager
  const rc = await EventManager.findOne({ where: { email: rcEmail } });
  if (rc === null) {
    res.send("You are not authorized in the system to create an event");
    res.sendStatus(500);
  }
  // create event
  const newEvent = await Event.create({
    eventName,
    eventDate,
    eventLocation,
    adminCode,
    scorekeeperCode,
    numBoulders,
    managerID: rc,
  }).save();
  // check event was created
  if (newEvent !== null) {
    res.send({ eventId: newEvent.eventID });
  } else {
    res.send(
      "There was an error creating the event, contact customer support."
    );
  }
});

router.post("/all", async (req, res) => {
  const { user } = req.body;
  if (user === undefined) {
    const events = await Event.find({});
    res.send(JSON.stringify(events));
  } else {
    const manager = await EventManager.findOne({ where: { email: user } });
    const events = await Event.find({ where: { managerID: manager } });
    res.send(JSON.stringify(events));
  }
});

router.post("/add-athlete", async (req, res) => {
  const { firstName, lastName, ageCat, gender, event } = req.body;

  const newClimber = await Climber.create({
    climberFirstName: firstName,
    climberLastName: lastName,
    ageCat,
    gender,
    event,
  }).save();

  res.send(newClimber.climberFirstName);
});

router.get("/athletes", async (req, res) => {
  const eventID = req.body;

  const athletes = await Climber.find({ where: { event: eventID } });

  console.log(athletes);

  res.send(JSON.stringify(athletes));
});
module.exports = router;
