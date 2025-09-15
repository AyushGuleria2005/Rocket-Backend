import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import { dbConnect } from "./config/db.js";
import cors from "cors";
import multer from "multer";

// Importing Models
import { College } from "./models/college.js";
import { User } from "./models/user.js";
import { Document } from "./models/document.js";

dotenv.config({ path: "./.env" });

const app = express();
const PORT = process.env.PORT || 3000;
app.use(express.json());

// ✅ CORS configuration
app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PATCH", "DELETE"],
  })
);

// ✅ Use memoryStorage to save files in MongoDB (not on disk)
const storage = multer.memoryStorage();
const upload = multer({ storage });

// ---------------- ROUTES ----------------

// ✅ Upload document
app.post("/upload", upload.array("pdfFiles"), async (req, res) => {
  try {
    const { text } = req.body;
    const files = req.files;

    console.log("Text:", text);
    console.log("Files:", files);

    const document = new Document({
      text,
      docs: files.map((file) => ({
        data: file.buffer, // raw binary
        name: file.originalname,
        type: file.mimetype,
        size: file.size,
      })),
    });

    await document.save();
    res.send("Document saved successfully 🚀");
  } catch (err) {
    console.error("Upload error:", err.message);
    res.status(500).send("Error saving document");
  }
});

// ✅ Download document
app.get("/downloadDoc/:docId/:docIndex", async (req, res) => {
  try {
    const { docId, docIndex } = req.params;
    const documentFind = await Document.findById(docId);

    if (!documentFind || !documentFind.docs[docIndex]) {
      return res.status(404).send("No PDF found");
    }

    const pdfFound = documentFind.docs[docIndex];

    res.set({
      "Content-Type": pdfFound.type,
      "Content-Disposition": `attachment; filename=${pdfFound.name}`,
    });

    res.send(pdfFound.data);
  } catch (err) {
    console.error("Download error:", err.message);
    res.status(500).send("Error downloading document");
  }
});

// ✅ Signup APIs
app.post("/collegeSignup", async (req, res) => {
  try {
    const collegeObj = { college_name: "Ramrao Adik Institute of Technology" };
    const college = new College(collegeObj);
    await college.save();
    res.send("College saved successfully in DB");
  } catch (err) {
    res.status(500).send("Error saving college");
  }
});

app.post("/signup", async (req, res) => {
  try {
    const user = new User(req.body);
    await user.save();
    res.send("User saved successfully in DB");
  } catch (err) {
    res.status(500).send("Error saving user");
  }
});

// ✅ Connect to DB and start server
dbConnect()
  .then(() => {
    console.log("Database connection established 🥳");
    app.listen(PORT, () => {
      console.log("App is running at port", PORT);
    });
  })
  .catch((error) => {
    console.error("Database connection failed 😣", error);
  });
