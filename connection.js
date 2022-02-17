const { MongoClient } = require("mongodb");

const client = new MongoClient(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

async function run() {

    // Connect the client to the server
    await client.connect();
    // Establish and verify connection
    await client.db("reaction").command({ ping: 1 });
    console.log("Connected successfully to server");
}

module.exports = {
    client,
    run
}