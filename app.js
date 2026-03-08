const express = require("express");
const cors = require("cors");

const capsuleRoutes = require("./routes/capsuleRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/", capsuleRoutes);

module.exports = app;
