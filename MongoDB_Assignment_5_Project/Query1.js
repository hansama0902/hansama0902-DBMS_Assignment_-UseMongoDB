const { MongoClient } = require("mongodb");

async function run() {
  const uri = "mongodb://localhost:27017";
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const database = client.db("ieeevisTweets");
    const collection = database.collection("tweet");

    // Find tweets that are not retweets and not replies
    const filter = {
      retweeted_status: { $exists: false },
      $or: [
        { in_reply_to_status_id: null },
        { in_reply_to_status_id: { $exists: false } }
      ]
    };


    const count = await collection.countDocuments(filter);
    console.log("Query1: Number of tweets that are not retweets or replies:", count);
  } finally {
    await client.close();
  }
}

run().catch(console.dir);
