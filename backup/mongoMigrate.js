require("dotenv").config();
const { MongoClient } = require("mongodb");
const collections = [
    "Products",
    "Catalogs",
    "Tags",
    "cfs_gridfs.image.chunks",
    "cfs_gridfs.image.files",
    "cfs_gridfs.large.chunks",
    "cfs_gridfs.large.files",
    "cfs_gridfs.medium.chunks",
    "cfs_gridfs.medium.files",
    "cfs_gridfs.small.chunks",
    "cfs_gridfs.small.files",
    "cfs_gridfs.thumbnail.chunks",
    "cfs_gridfs.thumbnail.files"
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

    await originClient.connect();
    await originClient.db("reaction").command({ ping: 1 });

    await destinationClient.connect();
    await destinationClient.db("reaction").command({ ping: 1 });
}

async function mongoMigrate() {
    try {
        await connect();
        const originDb = originClient.db("reaction");
        const destinationDb = destinationClient.db("reaction");
        for (let collection of collections) {
            console.log(`migrating ${collection}...`);
            const originEntity = originDb.collection(collection);
            const destinationEntity = destinationDb.collection(collection);

            const documents = await originEntity.find().toArray();

            for(let document of documents) {
                await destinationEntity.insertOne(document);
                console.log(document._id, `of ${collection} created`);
            }
        }

        await originClient.close();
        await destinationClient.close();
        console.log("migration done!");
    } catch (error) {
        console.error("migration error: ", error);
        await originClient.close();
        await destinationClient.close();
    }
}



mongoMigrate();