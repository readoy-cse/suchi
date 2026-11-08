import mongoose from "mongoose";

const submissionSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 160 },
    type: { type: String, required: true, enum: ["event", "news", "suggestion"] },
    description: { type: String, required: true, trim: true, maxlength: 10000 },
    eventDate: { type: Date },
    location: { type: String, trim: true, maxlength: 160, default: "" },
    resourceUrl: { type: String, trim: true, maxlength: 2048, default: "" },
    submittedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    status: { type: String, required: true, enum: ["pending", "approved", "rejected"], default: "pending" },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    reviewedAt: { type: Date },
    reviewNote: { type: String, trim: true, maxlength: 500, default: "" },
  },
  { timestamps: true },
);

submissionSchema.index({ status: 1, createdAt: 1 });
submissionSchema.index({ submittedBy: 1, createdAt: -1 });

export const Submission = mongoose.models.Submission ?? mongoose.model("Submission", submissionSchema);