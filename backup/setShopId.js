require("dotenv").config();
const { MongoClient } = require("mongodb");
const collections = [
    "Templates"
];

const originClient = new MongoClient(process.env.MONGO_ORIGIN, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

const destinationClient = new MongoClient(process.env.MONGO_DESTINATION, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

async function connect() {

    await destinationClient.connect();
    await destinationClient.db("reaction").command({ ping: 1 });
}

async function setShopId() {
    try {
        await connect();
        console.log("connected!");
        const destinationDb = destinationClient.db("reaction");
        for (let collection of collections) {
            console.log(`updating ${collection}...`);
            const destinationEntity = destinationDb.collection(collection);

            const documents = await destinationEntity.find().toArray();

            for(let document of documents) {
                await destinationEntity.updateOne({_id: document._id}, {
                    $set: {
                        shopId: "5tiHtRk5ErM7gJwmi"
                    }
                });
                console.log(document._id, `of ${collection} updated`);
            }
        }

        await originClient.close();
        await destinationClient.close();
        console.log("update done!");
    } catch (error) {
        console.error("migration error: ", error);
        await originClient.close();
        await destinationClient.close();
    }
}



setShopId();