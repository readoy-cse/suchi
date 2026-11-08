import mongoose from "mongoose";

const notificationLogSchema = new mongoose.Schema(
  {
    contentType: { type: String, required: true, enum: ["routine", "exam", "notice", "submission"] },
    contentId: { type: mongoose.Schema.Types.ObjectId, required: true },
    channel: { type: String, required: true, enum: ["telegram"], default: "telegram" },
    status: { type: String, required: true, enum: ["sent", "failed"] },
    errorMessage: { type: String, maxlength: 500, default: "" },
    sentAt: { type: Date },
  },
  { timestamps: true },
);

notificationLogSchema.index({ createdAt: -1 });

export const NotificationLog = mongoose.models.NotificationLog ?? mongoose.model("NotificationLog", notificationLogSchema);