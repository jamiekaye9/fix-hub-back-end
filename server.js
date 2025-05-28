const dotenv = require("dotenv");
dotenv.config();
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const cors = require("cors");
const logger = require("morgan");

const testJwtRouter = require("./controllers/test-jwt");
const authRouter = require("./controllers/auth");
const usersRouter = require("./controllers/users");
const ticketsRouter = require("./controllers/tickets");

mongoose.connect(process.env.MONGODB_URI);

mongoose.connection.on("connected", () => {
  console.log(`Connected to MongoDB ${mongoose.connection.name}.`);
});

app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  credentials: true,
}));
app.use(express.json());
app.use(logger("dev"));

app.use("/auth", authRouter);
app.use("/test-jwt", testJwtRouter);
app.use("/users", usersRouter);
app.use("/tickets", ticketsRouter);

app.listen(3000, () => {
  console.log("The express app is ready");
});
