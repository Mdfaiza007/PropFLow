import mongoose from "mongoose";

const leaseSchema = new mongoose.Schema({
  property: {
    type: mongoose.Schema.ObjectId,
    ref: "Property",
    required: true,
  },
  tenant: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: true,
  },
  owner: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: true,
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
  },
  monthlyRent: {
    type: Number,
    required: true,
  },
  securityDeposit: {
    type: Number,
  },
  status: {
    type: String,
    enum: ["Draft", "Active", "Expiring", "Expired"],
    default: "Draft",
  },
  signed: {
    type: Boolean,
    default: false,
  },
  signedAt: {
    type: Date,
  },
  documentUrl: {
    type: String,
  },
}, {
  timestamps: true,
});

export default mongoose.model("Lease", leaseSchema);
