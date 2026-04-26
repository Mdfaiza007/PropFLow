import mongoose from "mongoose";

const maintenanceRequestSchema = new mongoose.Schema({
  tenant: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: true,
  },
  property: {
    type: mongoose.Schema.ObjectId,
    ref: "Property",
    required: true,
  },
  owner: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: true,
  },
  manager: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  priority: {
    type: String,
    enum: ["Low", "Medium", "High"],
    default: "Low",
  },
  status: {
    type: String,
    enum: ["Pending", "Assigned", "In Progress", "Resolved"],
    default: "Pending",
  },
  photos: {
    type: [String],
  },
  vendor: {
    type: String,
  },
  vendorPhone: {
    type: String,
  },
  estimatedCost: {
    type: Number,
  },
  resolvedAt: {
    type: Date,
  },
}, {
  timestamps: true,
});

export default mongoose.model("MaintenanceRequest", maintenanceRequestSchema);
