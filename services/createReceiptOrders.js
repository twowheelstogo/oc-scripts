require("dotenv").config();
const { query: OrderQuery } = require("../utils/query");
const axios = require("axios");
const { buildOrder } = require("../utils/buildOrder");

const connection = require("../connection");

const createReceiptOrders = async () => {
    await connection.run();
    const client = connection.client;
    console.log("creating");
    const db = client.db("reaction");
    const orders = db.collection("Orders");
    const accounts = db.collection("Accounts");
    const response = await orders.find(OrderQuery).toArray();
    for (var document of response) {
        try {
            const obj = document;
            const account = await accounts.findOne({ _id: document.accountId });

            if (account) {
                Object.assign(obj, { account });
            }
            const order = buildOrder(obj);
            const rs = await axios({
                method: "post",
                url: process.env.PRINTER_API_URL,
                data: order
            });
            console.log(rs.data);
        } catch (error) {
            console.error(error)
        }
    }
    await client.close();
    console.log("connection closed");
}

createReceiptOrders();
