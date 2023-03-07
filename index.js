const express = require("express");
const cors = require("cors");
const app = express();
const _crypto = require("crypto");
app.use(cors());
const connectDb = require("./app/database/index");
const { ObjectId } = require("mongodb");
app.use(express.json());
require("dotenv").config();

const PORT = process.env.PORT || 8000;

app.get("/", async (req, res) => {
  const message = `server is running on port ${process.env.PORT}`;
  res.send(message);
});

app.get("/test-db", async (req, res) => {
  let db = await connectDb();
  let users = await db.collection("Collections").find({}).toArray();
  res.status(200).json(users);
});

app.get("/my-profile", async (req, res) => {
  let db = await connectDb();
  let users = await db.collection("Collections").find({}).toArray();
  res.status(200).json(users[0]);
});

app.post("/auth/login", async (req, res) => {
  if (!req.body.username) return res.status(401).send({ Message: "Username is required." });
  if (req.body.username) {
    let db = await connectDb();
    users = await db
      .collection("Collections")
      .find({
        $or: [{ Email: req.body.username }, { Mobile: req.body.username }],
      })
      .toArray();
    if (users.length == 0) return res.status(404).send({ Message: "Invalid Username." });
    res.status(201).send({ Message: "Logged in successfully" });
  }
});

app.post("/auth/forgot-password", async (req, res) => {
  if (!req.body.username) return res.status(401).send({ Message: "Username is required." });
  if (req.body.username) {
    let db = await connectDb();
    users = await db
      .find({
        $or: [{ Email: req.body.username }, { Mobile: req.body.username }],
      })
      .toArray();
    if (users.length == 0) return res.status(404).send({ Message: "Invalid Username." });
    // TODO : sent otp and template on email
    res.status(201).send({ Message: "OTP sent to your registered Email address." });
  }
});

app.listen(PORT, console.log(`server is listening ${PORT}`));
