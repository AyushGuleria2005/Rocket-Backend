import express from "express";
import dotenv from "dotenv";
import { dbConnect } from "./config/db.js";

dotenv.config({
  path: "./.env",
});

const app = express();
const PORT = process.env.PORT;

dbConnect()
  .then(() => {
    console.log("Database connection established 🥳");
    app.listen(PORT, () => {
      console.log("App is running at port ", PORT);
    });
  })
  .catch((error) => {
    console.error("Database connection failed 😣");
  });
