const mongoose = require("mongoose");

async function connectDb() {
  const uri = process.env.DATABASE_URL;
  if (!uri) {
    throw new Error("DATABASE_URL is required");
  }
  mongoose.set("strictQuery", true);
  await mongoose.connect(uri);
}

module.exports = { connectDb, mongoose };
