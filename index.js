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

app.get("/all-purchases/:type?", async (req, res) => {
  let db = await connectDb();
  let products = [];
  if (req.params.type) {
    if (req.params.type == "buy" || req.params.type == "sell") {
      products = await db.collection("Products").find({ productType: req.params.type }).toArray();
    } else {
      return res.status(404).send({ Message: "Product type is invalid, It should be buy or sell." });
    }
  } else {
    products = await db.collection("Products").find({}).toArray();
  }
  res.status(200).json(products);
});

app.get("/product/:_id", async (req, res) => {
  let db = await connectDb();
  let products = [];
  if (req.params._id) {
    products = await db
      .collection("Products")
      .find({ _id: ObjectId(req.params._id) })
      .toArray();
  } else {
    return res.status(404).send({ Message: `Product with.${_id} is not available.` });
  }
  res.status(200).json({ product: products[0] });
});

app.post("/product", async (req, res) => {
  let db = await connectDb();
  let product;
  const productDetails = req.body;
  const isEmpty = Object.values(productDetails).every((x) => x === null || x === "");
  if (productDetails && !isEmpty) {
    product = await db.collection("Products").insertOne(productDetails);
  } else {
    return res.status(404).send({ Message: `Please provide product details.` });
  }
  res.status(200).send({ message: "Product added successfully", productId: product.insertedId });
});

app.put("/updateProduct/:_id", async (req, res) => {
  let db = await connectDb();
  let product;
  if (req.params._id) {
    const productDetails = req.body;
    const isEmpty = Object.values(productDetails).every((x) => x === null || x === "");
    if (isEmpty) {
      return res.status(404).send({ Message: `Please provide product details.` });
    } else {
      product = await db.collection("Products").replaceOne({ _id: ObjectId(req.params._id) }, req.body);
    }
  } else {
    return res.status(404).send({ Message: `Product with.${_id} is not available.` });
  }
  res.status(200).json({ message: "Product updated successfully" });
});

app.delete("/deleteProduct", async (req, res) => {
  let db = await connectDb();
  let product;
  if (req.query.productId) {
    if (typeof req.query.productId === "string") {
      product = await db.collection("Products").deleteOne({ _id: ObjectId(req.query.productId) });
    }
  } else {
    return res.status(404).send({ Message: `Please provide the product id` });
  }
  res.status(200).json({ message: "Product deleted successfully" });
});

app.post("/auth/login", async (req, res) => {
  if (!req.body.username) return res.status(401).send({ Message: "Username is required." });
  if (req.body.username) {
    let db = await connectDb();
    users = await db
      .collection("Collections")
      .find({
        $or: [{ Email: req.body.username }, { Mobile: req.body.username }],
        $and: [{ Password: req.body.password }],
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
