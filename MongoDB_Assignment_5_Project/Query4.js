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
            tweet_count: { $sum: 1 },
            total_retweets: { $sum: "$retweet_count" },
          },
        },
        {
          $match: {
            tweet_count: { $gt: 3 },
          },
        },
        {
          $project: {
            _id: 1,
            avg_retweets: { $divide: ["$total_retweets", "$tweet_count"] },
          },
        },
        {
          $sort: {
            avg_retweets: -1,
          },
        },
        {
          $limit: 10,
        },
      ])
      .toArray();

    console.log("Query4: Top 10 users with the highest average number of retweets:", topUsers);
  } finally {
    await client.close();
  }
}

run().catch(console.dir);