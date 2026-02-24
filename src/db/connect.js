// src/db/connect.js
import mongoose from "mongoose";

let cached = globalThis.mongoose;

if (!cached) {
  cached = globalThis.mongoose = { conn: null, promise: null };
}

export async function connectToDB() {

  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    const { MONGO_URI } = process.env;

    if (!MONGO_URI)
      throw new Error("Falta la variable de entorno MONGO_URI");

    cached.promise = mongoose.connect(MONGO_URI, {
      dbName: "BackPWA",
      bufferCommands: false
    }).then((mongoose) => mongoose.connection);
  }

  cached.conn = await cached.promise;
  return cached.conn;
}