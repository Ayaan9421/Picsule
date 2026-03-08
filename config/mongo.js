const { MongoClient } = require("mongodb");

const mongoURL = process.env.MONGO_URL;
const dbName = "picsule";

let db;

async function connectDB() {
        const client = new MongoClient(mongoURL);
        await client.connect();
        db = client.db(dbName);
        console.log("MongoDB connected");
}

function getCollection() {
        return db.collection("picsule");
}

module.exports = { connectDB, getCollection };