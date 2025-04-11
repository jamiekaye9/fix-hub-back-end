const express = require("express");
const verifyToken = require("../middleware/verify-token");
const Ticket = require("../models/ticket");
const User = require("../models/user");

const router = express.Router();

router.post("/", verifyToken, async (req, res) => {
  try {
    const allTickets = await Ticket.find();
    const serviceDesk = await User.find({ role: "serviceDesk" });
    const ticketCounts = await Promise.all(
      serviceDesk.map(async (user) => {
        const count = await Ticket.countDocuments({ assignedTo: user._id });
        return { user, count };
      })
    );
    const leastBusy = ticketCounts.reduce((min, curr) => {
      return curr.count < min.count ? curr : min;
    });
    req.body.number = allTickets.length + 1;
    req.body.status = "open";
    req.body.assignedTo = leastBusy.user._id;
    req.body.openedBy = req.user._id;
    const ticket = await Ticket.create(req.body);
    ticket._doc.openedBy = req.user;
    const populatedTicket = await Ticket.findById(ticket._id).populate([
      "openedBy",
      "assignedTo",
    ]);
    res.status(201).json(populatedTicket);
  } catch (e) {
    res.status(500).json({ e: e.message });
  }
});

router.get("/", verifyToken, async (req, res) => {
  try {
    const tickets = await Ticket.find({})
      .populate(["openedBy", "assignedTo"])
      .sort({ createdAt: "desc" });
    res.status(200).json(tickets);
  } catch (e) {
    res.status(500).json({ e: e.message });
  }
});

router.get("/:ticketId", verifyToken, async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.ticketId).populate([
      "openedBy",
      "assignedTo",
      "comments.author",
    ]);
    res.status(200).json(ticket);
  } catch (e) {
    res.status(500).json({ e: e.message });
  }
});

router.put("/:ticketId", verifyToken, async (req, res) => {
  try {
    const ticket = await Ticket.findByIdAndUpdate(req.params.ticketId);
    if (!ticket.openedBy.equals(req.user._id)) {
      return res
        .status(403)
        .send("You are not authorized to update this ticket");
    }
    const updatedTicket = await Ticket.findByIdAndUpdate(
      req.params.ticketId,
      req.body,
      { new: true }
    ).populate(["openedBy", "assignedTo"]);
    res.status(200).json(updatedTicket);
  } catch (e) {
    res.status(500).json({ e: e.message });
  }
});

router.delete("/:ticketId", verifyToken, async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.ticketId);
    if (!ticket.openedBy.equals(req.user._id)) {
      return res
        .status(403)
        .send("You are not authorized to close this ticket");
    }
    const deletedTicket = await Ticket.findByIdAndDelete(req.params.ticketId);
    res.status(204).json(deletedTicket);
  } catch (e) {
    res.status(500).json({ e: e.message });
  }
});

router.post("/:ticketId/comments", verifyToken, async (req, res) => {
  try {
    req.body.author = req.user._id;
    const ticket = await Ticket.findById(req.params.ticketId);
    ticket.comments.push(req.body);
    await ticket.save();
    const newComment = ticket.comments[ticket.comments.length - 1];
    newComment._doc.author = req.user;
    res.status(201).json(newComment);
  } catch (e) {
    res.status(500).json({ e: e.message });
  }
});

router.put("/:ticketId/comments/:commentId", verifyToken, async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.ticketId);
    const comment = ticket.comments.id(req.params.commentId);
    if (comment.author.toString() !== req.user._id) {
      return res
        .status(403)
        .json({ message: "You are not authorized to update this comment" });
    }
    comment.text = req.body.text;
    await ticket.save();
    res.status(200).json({ message: "Comment updated successfully" });
  } catch (e) {
    res.status(500).json({ e: e.message });
  }
});

router.delete(
  "/:ticketId/comments/:commentId",
  verifyToken,
  async (req, res) => {
    try {
      const ticket = await Ticket.findById(req.params.ticketId);
      const comment = ticket.comments.id(req.params.commentId);
      if (comment.author.toString() !== req.user._id) {
        return res
          .status(403)
          .json({ message: "You are not authorized to delete this comment" });
      }
      ticket.comments.remove({ _id: req.params.commentId });
      await ticket.save();
      res.status(200).json({ message: "Comment deleted successfully" });
    } catch (e) {
      res.status(500).json({ e: e.message });
    }
  }
);

module.exports = router;
