import mongoose from "mongoose";

const noticeSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 160 },
    body: { type: String, required: true, trim: true, maxlength: 10000 },
    category: { type: String, required: true, trim: true, maxlength: 40 },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    publishedAt: { type: Date, default: Date.now, required: true },
  },
  { timestamps: true },
);

noticeSchema.index({ publishedAt: -1 });

export const Notice = mongoose.models.Notice ?? mongoose.model("Notice", noticeSchema);
