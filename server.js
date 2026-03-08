require("dotenv").config();

const app = require("./app");

const { connectDB } = require("./config/mongo");

const PORT = 8000;

async function start() {

        await connectDB();

        app.listen(PORT, () => {
                console.log("Server running on port " + PORT);
        });

}

start();