var mongoClient = require("mongodb").MongoClient;
require("dotenv").config();

var url = process.env.MONGO_URI;
const database = "Medical-Store";

const client = new mongoClient(url);

async function connectDb() {
  let result = await client.connect();
  return result.db(database).collection("Collections");
}

module.exports = connectDb;
