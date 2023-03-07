var mongoClient = require("mongodb").MongoClient;
require("dotenv").config();

var url = "mongodb+srv://Satyam123:TZjOPhtHgtTKHlNh@first-cluster.2i0ptnt.mongodb.net/Medical-Store?retryWrites=true&w=majority";
const database = "Medical-Store";

const client = new mongoClient(url, { useNewUrlParser: true, useUnifiedTopology: true });

async function connectDb() {
  let result = await client.connect();
  return result.db(database).collection("Collections");
}

module.exports = connectDb;
