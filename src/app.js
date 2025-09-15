import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import { dbConnect } from "./config/db.js";
import cors from "cors";
import multer from "multer";
import fs from "fs";

//RAG
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { TaskType } from "@google/generative-ai";
import { QdrantVectorStore } from "@langchain/qdrant";

// Importing Models
import { College } from "./models/college.js";
import { User } from "./models/user.js";
import { Document } from "./models/document.js";

dotenv.config({ path: "./.env" });

const app = express();
const PORT = process.env.PORT || 3000;
app.use(express.json());

// Cors config
app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PATCH", "DELETE"],
  })
);

// Storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}_${file.originalname}`);
  },
});
const upload = multer({ storage });

// Upload document API
app.post("/upload", upload.array("files"), async (req, res) => {
  try {
    const pdfs = req.files;
    const {text} = req.body;
    const pdfPathList = pdfs.map((pdf) => {
      return pdf.path;
    });
    console.log(pdfPathList);

    // Chunking each pdf file using path
    for (const path of pdfPathList) {
      //Chunking Logic
      const loader = new PDFLoader(path);
      const docs = await loader.load();

      // Chunks -> Vector embedding model
      const embeddings = new GoogleGenerativeAIEmbeddings({
        apiKey: process.env.GEMINI_API_KEY,
        model: "text-embedding-004", // 768 dimensions
        taskType: TaskType.RETRIEVAL_DOCUMENT,
        title: "Document title",
      });

      const vectorStore = await QdrantVectorStore.fromDocuments(
        docs,
        embeddings,
        {
          url: "http://localhost:6333",
          collectionName: `${text}-collection`,
        }
      );

      console.log("Indexing of documents done 🥳");
    }
    res.send("Everything fine");
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

// ✅ Signup API
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

// User Signup API
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
