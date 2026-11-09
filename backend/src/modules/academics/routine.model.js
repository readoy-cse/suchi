import mongoose from "mongoose";

const routineSchema = new mongoose.Schema(
  {
    courseTitle: { type: String, required: true, trim: true, maxlength: 120 },
    courseCode: { type: String, trim: true, uppercase: true, maxlength: 20, default: "" },
    teacher: { type: String, required: true, trim: true, maxlength: 100 },
    day: { type: String, required: true, enum: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"] },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    room: { type: String, required: true, trim: true, maxlength: 40 },
    topic: { type: String, trim: true, maxlength: 500, default: "" },
    resourceUrl: { type: String, trim: true, maxlength: 2048, default: "" },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true },
);

routineSchema.index({ courseCode: 1 });
routineSchema.index({ day: 1, startTime: 1 });

export const Routine = mongoose.models.Routine ?? mongoose.model("Routine", routineSchema);
