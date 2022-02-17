require("dotenv").config();
const connection = require("../connection");

const cleanAddressBooks = async () => {
    await connection.run();
    console.log("cleaning");
    const client = connection.client;
    const db = client.db("reaction");
    const accounts = db.collection("Accounts");

    const response = await accounts.find({
        "profile.addressBook": {
            $exists: true, $not: { $size: 0 }
        }
    }).toArray();

    for (var account of response) {
        try {
            await accounts.updateOne({ _id: account._id }, {
                $set: {
                    "profile.addressBook": []
                }
            });
            console.log("id updated", account._id);
        } catch (error) {
            console.error(error);
        }
    }
    await client.close();
    console.log("connection closed");
}

cleanAddressBooks();
