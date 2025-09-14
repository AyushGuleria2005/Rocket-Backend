import mongoose from "mongoose";

const documentSchema = mongoose.Schema({
  text: {
    type: String,
    required: true,
  },
  docs: [
    {
      data: Buffer,          // raw PDF binary
      contentType: String,   // e.g. 'application/pdf'
      fileName: String,      // original file name
    },
  ],
});

export const Document = mongoose.model("Document", documentSchema);
