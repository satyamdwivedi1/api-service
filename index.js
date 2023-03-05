const express = require("express");
const cors = require("cors");
const app = express();
const _crypto = require("crypto");
app.use(cors());
const connectDb = require("./app/database/index");
const { ObjectId } = require("mongodb");
app.use(express.json());

const PORT = process.env.PORT || 8000;

app.get("/", async (req, res) => {
  // let db = await connectDb();
  // let users = await db.find({}).toArray();
  console.log("test");
  res.send({ user: { message: "success" } });
});

app.post("/auth/login", async (req, res) => {
  if (!req.body.username) return res.status(401).send({ Message: "Username is required." });
  if (req.body.username) {
    let db = await connectDb();
    users = await db
      .find({
        $or: [{ Email: { $regex: req.body.username } }, { Mobile: { $regex: req.body.username } }],
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
        $or: [{ Email: { $regex: req.body.username } }, { Mobile: { $regex: req.body.username } }],
      })
      .toArray();
    if (users.length == 0) return res.status(404).send({ Message: "Invalid Username." });
    // TODO : sent otp and template on email
    res.status(201).send({ Message: "OTP sent to your registered Email address." });
  }
});

app.listen(PORT, console.log(`server is listening ${PORT}`));
