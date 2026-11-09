import mongoose from "mongoose";

const examSchema = new mongoose.Schema(
  {
    courseTitle: { type: String, required: true, trim: true, maxlength: 120 },
    courseCode: { type: String, trim: true, uppercase: true, maxlength: 20, default: "" },
    examType: { type: String, required: true, trim: true, maxlength: 40 },
    date: { type: Date, required: true },
    startTime: { type: String, required: true },
    room: { type: String, required: true, trim: true, maxlength: 40 },
    topics: { type: [String], default: [] },
    suggestion: { type: String, trim: true, maxlength: 2000, default: "" },
    resourceUrl: { type: String, trim: true, maxlength: 2048, default: "" },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true },
);

examSchema.index({ courseCode: 1, date: 1 });
examSchema.index({ date: 1 });

export const Exam = mongoose.models.Exam ?? mongoose.model("Exam", examSchema);
