import mongoose from "mongoose";

const tenantSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
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
  emergencyContact: {
    type: String,
  },
  occupation: {
    type: String,
  },
  aadharNumber: {
    type: String,
  },
  panNumber: {
    type: String,
  },
}, {
  timestamps: true,
});

export default mongoose.model("Tenant", tenantSchema);
