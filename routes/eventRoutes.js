import express from "express";
import Event from "../models/Event.js";
import authMiddleware from "../middleware/authMiddleware.js";
import mongoose from "mongoose";

const router = express.Router();

router.post("/", authMiddleware, async (req, res) => {
  try {
    const { name, description, date } = req.body;
    const newEvent = new Event({
      name,
      description,
      date,
      createdBy: req.user.id,
    });
    await newEvent.save();
    res.status(201).json({ message: "Event succesfully created" });
  } catch (error) {
    console.log("Error in EventRoute", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

router.get("/allEvents", async (req, res) => {
  try {
    const events = await Event.find();
    if (!events) {
      return res.status(404).json({ message: "Event not found" });
    }
    res.status(200).json(events);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: "Event not found" });

    // if (event.createdBy.toString() !== req.user.id) {
    //   return res.status(403).json({ message: "Not authorized" });
    // }

    event.name = req.body.name || event.name;
    event.description = req.body.description || event.description;
    event.date = req.body.date || event.date;

    await event.save();
    res.json(event);
  } catch (error) {
    res.status(500).json({ message: "Error updating event" });
  }
});

router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: "Event not found" });

    await event.deleteOne();
    res.json({ message: "Event deleted" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting event" });
  }
});

router.post("/:id/attend", authMiddleware, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    console.log("Event found:", event);
    if (!event) return res.status(404).json({ message: "Event not found" });

    if (!event.attendees.includes(req.user.id)) {
      event.attendees.push(req.user.id);
      await event.save();
    }

    res.json(event);
  } catch (error) {
    res.status(500).json({ message: "Error joining event" });
  }
});

export default router;
