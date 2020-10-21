import { Router } from "express";
import { EventManager } from "../entities/EventManager";

const router = Router();

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await EventManager.findOne({ where: { email } });
  user !== undefined && user.password === password
    ? res.sendStatus(200)
    : res.sendStatus(500);
});

module.exports = router;
