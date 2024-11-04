const { MongoClient } = require("mongodb");

async function run() {
  const uri = "mongodb://localhost:27017";
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const database = client.db("ieeevisTweets");
    const collection = database.collection("tweet");
    const topUsers = await collection
      .aggregate([
        {
          $group: {
            _id: "$user.screen_name",
            followers_count: { $max: "$user.followers_count" },
          },
        },
        { $sort: { followers_count: -1 } },
        { $limit: 10 },
      ])
      .toArray();

    console.log("Query2: Top 10 screen names by followers count:", topUsers);
  } finally {
    await client.close();
  }
}

run().catch(console.dir);
