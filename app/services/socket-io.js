const express = require("express");
const router = express.Router();

router.get("/", (req, res, next) => {
  res.status(200).json({ message: "socket.io connected successfully." });
});

module.exports = router;
