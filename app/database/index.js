var MongoClient = require("mongodb").MongoClient;
require("dotenv").config();

var url = process.env.MONGO_URI;
const database = "Medical-Store";

const client = new mongoClient(url, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function connectDb() {
  let result = await client.connect();
  console.log(result);
  return result.db(database).collection("Collections");
}

module.exports = connectDb;

// async function main() {
/**
 * Connection URI. Update <username>, <password>, and <your-cluster-url> to reflect your cluster.
 * See https://docs.mongodb.com/ecosystem/drivers/node/ for more details
 */
// const uri = process.env.MONGO_URI;

// const client = new MongoClient(uri);

// const database = "Medical-Store";

// try {
// Connect to the MongoDB cluster
// return await client.connect();
// return result.db(database).collection("Collections");
// Make the appropriate DB calls
// await listDatabases(client);
//   } catch (e) {
//     console.error(e);
//   } finally {
//     await client.close();
//   }
// }

// main().catch(console.error);

// module.exports = main;
