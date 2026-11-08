import mongoose from "mongoose";

const commentSchema = new mongoose.Schema(
  {
    contentType: { type: String, required: true, enum: ["routine", "exam", "notice", "submission"] },
    contentId: { type: mongoose.Schema.Types.ObjectId, required: true },
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    body: { type: String, required: true, trim: true, maxlength: 2000 },
  },
  { timestamps: true },
);

commentSchema.index({ contentType: 1, contentId: 1, createdAt: 1 });

export const Comment = mongoose.models.Comment ?? mongoose.model("Comment", commentSchema);