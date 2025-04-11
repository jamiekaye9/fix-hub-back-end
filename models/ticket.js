const mongoose = require("mongoose");

const commentsSchema = new mongoose.Schema(
  {
    text: {
      type: String,
      required: true,
    },
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

const ticketsSchema = new mongoose.Schema(
  {
    number: {
      type: Number,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "low",
      required: true,
    },
    status: {
      type: String,
      enum: ["open", "inProgress", "resolved", "closed"],
      default: "Open",
      required: true,
    },
    type: {
      type: String,
      enum: ["software", "hardware"],
      default: "software",
      required: true,
    },
    technology: {
      type: String,
      required: true,
    },
    openedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    comments: [commentsSchema],
  },
  { timestamps: true }
);

const Ticket = mongoose.model("Ticket", ticketsSchema);

module.exports = Ticket;
