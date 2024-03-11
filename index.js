const express = require("express");
const cors = require("cors");
const app = express();
const _crypto = require("crypto");
const connectDb = require("./app/database/index");
const { ObjectId } = require("mongodb");
app.use(express.json());
require("dotenv").config();
const http = require("http");
const server = http.createServer(app);
// const io = require("socket.io")(server, {
//   cors: { origin: "*" },
// });
app.use(cors());

const PORT = process.env.PORT || 8000;

app.get("/", async (req, res) => {
  const message = `server is running on port ${process.env.PORT}`;
  res.send(message);
});

app.get("/test-db", async (req, res) => {
  let db = await connectDb();
  let users = await db.collection("Users").find({}).toArray();
  res.status(200).json(users);
});

app.get("/my-profile", async (req, res) => {
  let db = await connectDb();
  let users = await db.collection("Users").find({}).toArray();
  res.status(200).json(users[0]);
});

app.post("/all-purchases/:type?", async (req, res) => {
  let db = await connectDb();
  let products = [];
  if (req.params.type && req.body && !req.body?.filters) {
    if (req.params.type == "buy" || req.params.type == "sell") {
      products = await db.collection("Products").find({ productType: req.params.type }).toArray();
    } else {
      return res.status(404).send({ Message: "Product type is invalid, It should be buy or sell." });
    }
  } else {
    products = await db.collection("Products").find({}).toArray();
  }
  if (req.body && req.body?.filters && req.params.type) {
    if (req.body?.filters.length === 1) {
      const filterByCreated = req.body?.filters;
      products = await db
        .collection("Products")
        .find({
          updatedOn: {
            $gte: new Date(filterByCreated[0].value),
          },
          productType: req.params.type,
        })
        .toArray();
    } else {
      const filterByRange = req.body?.filters;
      products = await db
        .collection("Products")
        .find({
          updatedOn: {
            $gt: new Date(filterByRange[0].value).toISOString(),
            $lte: new Date(filterByRange[1].value).toISOString(),
          },
          productType: req.params.type,
        })
        .toArray();
    }
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

app.get("/getAllCount", async (req, res) => {
  let db = await connectDb();
  let products = await db.collection("Products").find({}).toArray();
  let allBroughtProducts = await db.collection("Products").find({ productType: "buy" }).toArray();
  let allClients = allBroughtProducts.filter((v, i, a) => a.findIndex((v2) => v2.sellerName === v.sellerName) === i);
  res.status(200).json({ totalPurchases: products.length, totalClients: allClients.length });
});

app.get("/getAllSellAndBuy", async (req, res) => {
  let allSortingDates = [
    { startDate: "2023-01-01", endDate: "2023-01-31", month: "Jan", sortId: 1 },
    { startDate: "2023-02-01", endDate: "2023-02-29", month: "Feb", sortId: 2 },
    { startDate: "2023-03-01", endDate: "2023-03-31", month: "Mar", sortId: 3 },
    { startDate: "2023-04-01", endDate: "2023-04-31", month: "Apr", sortId: 4 },
    { startDate: "2023-05-01", endDate: "2023-05-31", month: "May", sortId: 5 },
    { startDate: "2023-06-01", endDate: "2023-06-31", month: "Jun", sortId: 6 },
    { startDate: "2023-07-01", endDate: "2023-07-31", month: "July", sortId: 7 },
    { startDate: "2023-08-01", endDate: "2023-08-31", month: "Aug", sortId: 8 },
    { startDate: "2023-09-01", endDate: "2023-09-31", month: "Sep", sortId: 9 },
    { startDate: "2023-10-01", endDate: "2023-10-31", month: "Oct", sortId: 10 },
    { startDate: "2023-11-01", endDate: "2023-11-31", month: "Nov", sortId: 11 },
    { startDate: "2023-12-01", endDate: "2023-12-31", month: "Dec", sortId: 12 },
  ];
  let db = await connectDb();
  let allBroughtProducts = [];
  let allSoldProducts = [];
  for (const x of allSortingDates) {
    let product = await getSortedProduct(db, x, "buy");
    allBroughtProducts.push(product);
  }
  for (const x of allSortingDates) {
    allSoldProducts.push(await getSortedProduct(db, x, "sell"));
  }
  await db.collection("Products").find().toArray();
  let profitAndLoss = [];
  for (const x of allSoldProducts) {
    for (const y of allBroughtProducts) {
      if (x.month === y.month) {
        const price = x.amount - y.amount;
        profitAndLoss.push({ month: y.month, price: price, bgColor: price > 0 ? "green" : "red" });
      }
    }
  }
  res.status(200).json({
    allSoldProducts: allSoldProducts.sort((a, b) => a.sortId - b.sortId),
    allBroughtProducts: allBroughtProducts.sort((a, b) => a.sortId - b.sortId),
    profitAndLoss: profitAndLoss,
  });
});

async function getSortedProduct(db, x, type) {
  const product = await db
    .collection("Products")
    .find({
      updatedOn: {
        $gt: new Date(x.startDate).toISOString(),
        $lte: new Date(x.endDate).toISOString(),
      },
      productType: type,
    })
    .toArray();
  let productPricesList = product.map((e) => +e.productPrice);
  return { amount: productPricesList.reduce((partialSum, a) => partialSum + a, 0), month: x.month, sortId: x.sortId };
}

app.post("/auth/login", async (req, res) => {
  if (!req.body.username) return res.status(401).send({ Message: "Username is required." });
  if (!req.body.password) return res.status(401).send({ Message: "Password is required." });
  if (req.body.username) {
    let db = await connectDb();
    users = await db
      .collection("Users")
      .find({
        $or: [{ Email: req.body.username }, { Mobile: req.body.username }],
        $and: [{ Password: req.body.password }],
      })
      .toArray();
    if (users.length == 0) return res.status(404).send({ Message: "Invalid Username or Password." });
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

// socket-io connection
// io.on("connection", (socket) => {
//   console.log("A user connected");

//   // Handle socket events here
//   socket.on("message", (message) => {
//     message.user.message = message.message;
//     message.user.time = new Date();
//     // Broadcast the message to all connected clients
//     console.log(message);
//     io.emit("chat message", message);

//     // Acknowledge the receipt of the message to the sender
//     socket.emit("message received", `Your message "${message}" was received.`);
//   });

//   socket.on("disconnect", () => {
//     console.log("User disconnected");
//   });
// });

server.listen(PORT, console.log(`server is listening ${PORT}`));
