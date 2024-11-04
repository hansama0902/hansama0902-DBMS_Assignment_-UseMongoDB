

const { MongoClient } = require("mongodb");

async function run() {
  const uri = "mongodb://localhost:27017";
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const database = client.db("ieeevisTweets");
    const collection = database.collection("tweet");

    // Aggregate to find the user with the most tweets
    const topTweeter = await collection
      .aggregate([
        {
          $group: {
            _id: {
              screen_name: "$user.screen_name",
              name: "$user.name"
            },
            tweet_count: { $sum: 1 },
          },
        },
        { $sort: { tweet_count: -1 } },
        { $limit: 1 },
      ])
      .toArray();

    if (topTweeter.length > 0) {
      console.log("Query3: User with the most tweets:", {
        screen_name: topTweeter[0]._id.screen_name,
        name: topTweeter[0]._id.name,
        tweet_count: topTweeter[0].tweet_count,
      });
    } else {
      console.log("No tweets found.");
    }
  } finally {
    await client.close();
  }
}

run().catch(console.dir);
