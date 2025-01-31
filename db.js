const mongoose = require("mongoose");
require("dotenv").config();

const mongoURL = process.env.DB_URL_LOCAL;
//const mongoURL = process.env.DB_URL;
mongoose.connect(mongoURL);

const db = mongoose.connection;

db.on("connected", () => {
  console.log("Connected");
});

db.on("error", (e) => {
  console.error("Connected", e);
});

db.on("disconnected", () => {
  console.log("Disconnected");
});

module.exports = db;
