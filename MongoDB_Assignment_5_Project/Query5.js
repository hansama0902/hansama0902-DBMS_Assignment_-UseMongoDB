const fs = require('fs');
const { MongoClient } = require('mongodb');

// MongoDB URI and database setup
const uri = 'mongodb://localhost:27017';
const dbName = 'tweets_database';
const userCollectionName = 'Users';
const tweetsCollectionName = 'Tweets_Only';

// Load the dump file and parse JSON data
const filePath = 'db/ieeevis2020Tweets.dump';
const tweetsData = fs.readFileSync(filePath, 'utf8').split('\n').filter(line => line).map(line => JSON.parse(line));

async function run() {
  const client = new MongoClient(uri);

  try {
    // Connect to MongoDB
    await client.connect();
    console.log('Connected to MongoDB');
    const db = client.db(dbName);

    const usersCollection = db.collection(userCollectionName);
    const tweetsCollection = db.collection(tweetsCollectionName);

    // Clear existing data
    await usersCollection.deleteMany({});
    await tweetsCollection.deleteMany({});

    const uniqueUsers = {};

    for (const tweet of tweetsData) {
      const userId = tweet.user.id;

      // Store unique user data
      if (!uniqueUsers[userId]) {
        uniqueUsers[userId] = {
          userId: userId,
          ...tweet.user
        };
      }

      const { user, ...tweetWithoutUser } = tweet;
      tweetWithoutUser.user_id = userId;

      // Remove user_mentions
      if (tweetWithoutUser.entities) {
        delete tweetWithoutUser.entities.user_mentions;
      }

      // Ensure that `retweeted_status` does not contain any user information
      if (tweetWithoutUser.retweeted_status) {
        const { user: retweetedUser, ...retweetedWithoutUser } = tweetWithoutUser.retweeted_status;
        tweetWithoutUser.retweeted_status = retweetedWithoutUser;
      }

      // Insert the tweet into the Tweets_Only collection
      await tweetsCollection.insertOne(tweetWithoutUser);
    }

    // Insert unique users into the Users collection
    const usersArray = Object.values(uniqueUsers);
    if (usersArray.length > 0) {
      await usersCollection.insertMany(usersArray);
    }

    // Get the count of documents 
    const usersCount = await usersCollection.countDocuments();
    const tweetsCount = await tweetsCollection.countDocuments();
    
    console.log('Query5:');
    console.log('Data migration completed:');
    console.log(`Users collection created with ${usersCount} documents.`);
    console.log(`Tweets_Only collection created with ${tweetsCount} documents.`);

    // Sample
    const userSample = await usersCollection.findOne();
    const tweetSample = await tweetsCollection.findOne();

    console.log('\nSample document from Users collection:');
    console.log(JSON.stringify(userSample, null, 2));

    console.log('\nSample document from Tweets_Only collection:');
    console.log(JSON.stringify(tweetSample, null, 2));
  } catch (err) {
    console.error('Error occurred:', err);
  } finally {
    // Close the connection
    await client.close();
  }
}

run().catch(console.dir);