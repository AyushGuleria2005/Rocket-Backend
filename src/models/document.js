import mongoose from "mongoose";

const documentSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true,
  },
  docs: [
    {
      data: { type: Buffer, required: true },   // raw PDF binary
      name: { type: String, required: true },   // file name
      type: { type: String, required: true },   // mimetype
      size: { type: Number, required: true },   // file size
    },
  ],
});

export const Document = mongoose.model("Document", documentSchema);
