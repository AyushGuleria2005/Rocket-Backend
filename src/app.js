import express from "express";
import mongoose from "mongoose";
import fs from "fs";
import dotenv from "dotenv";
import { dbConnect } from "./config/db.js";

//Importing Models
import { College } from "./models/college.js";
import { User } from "./models/user.js";
import { Document } from "./models/document.js";

dotenv.config({
  path: "./.env",
});

const app = express();
const PORT = process.env.PORT;
app.use(express.json());

// Loading pdf
const pdf1 = fs.readFileSync("pdf1.pdf");

//API to upload document
app.post("/documentUpload", async (req, res) => {
  const docObj = {
    text: "Tommorow is Holiday",
    docs: [{ data: pdf1, contentType: "application/pdf", fileName: "pdf1.pdf" }],
  };
  //We will create an instance of Document Model
  const document = new Document(docObj);
  await document.save();
  res.send("Document saved successfully");
});

//Api to read saved documents
app.get("/downloadDoc/:docId/:docIndex", async (req, res) => {
  try {
    const { docId,docIndex } = req.params;
    const documentFind = await Document.findById(docId);
    if(!documentFind || !documentFind.docs[docIndex]){
      throw new Error("No pdf found");
    }
    const pdfFound = documentFind.docs[docIndex];
    console.log(pdfFound.fileName)
    res.set({
      "Content-Type":`${pdfFound.contentType}`,
      "Content-Disposition":`attachment; filename=${pdfFound.fileName}`
    })
    res.send(pdfFound.data);
  } catch (err) {
    console.error(err.message);
  }
});

app.post("/CollegeSignup", async (req, res) => {
  const collegeObj = {
    college_name: "Ramrao Adik Institute of Technology",
  };
  //We create an instance of College model
  const college = new College(collegeObj);
  college.save();
  res.send("College saved successfully in DB");
});

app.post("/signup", async (req, res) => {
  const studentObj = req.body;
  console.log(req.body);
  //We will create an instance of User Model
  const user = new User(studentObj);
  await user.save();
  res.send("User saved successfully in DB");
});

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
