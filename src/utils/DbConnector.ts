import Mongoose from "mongoose";

Mongoose.Promise = global.Promise;

let database: Mongoose.Connection;

export const connect = () => {
    // add your own uri below
    const uri = "mongodb://127.0.0.1:27017/MessageLimiter";
    if (database) {
        return;
    }
    Mongoose.connect(uri, {
        useNewUrlParser: true,
        useFindAndModify: true,
        useUnifiedTopology: true,
        useCreateIndex: true,
    });

    database = Mongoose.connection;
    database.once("open", async () => {
         console.log("Connected to database");
    });
    database.on("error", () => {
        console.log("Error connecting to database");
    });
};

export const disconnect = () => {
  if (!database) {
    return;
  }
  Mongoose.disconnect();
};