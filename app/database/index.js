var mongoClient = require("mongodb").MongoClient;
var url = "mongodb://localhost:27017";
const database = "medical-store";
const client = new mongoClient(url);

async function connectDb() {
  let result = await client.connect();
  return result.db(database).collection("customers");
}

module.exports = connectDb;
