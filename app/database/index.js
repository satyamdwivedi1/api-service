var mongoClient = require("mongodb").MongoClient;
var url = process.env.url || "mongodb+srv://Satyam123:TZjOPhtHgtTKHlNh@first-cluster.2i0ptnt.mongodb.net/?retryWrites=true&w=majority";
const database = "Medical-Store";

const client = new mongoClient(url);

async function connectDb() {
  let result = await client.connect();
  return result.db(database).collection("Collections");
}

module.exports = connectDb;
