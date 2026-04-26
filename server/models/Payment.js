import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema({
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
  lease: {
    type: mongoose.Schema.ObjectId,
    ref: "Lease",
  },
  amount: {
    type: Number,
    required: true,
  },
  month: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ["Pending", "Paid", "Overdue"],
    default: "Pending",
  },
  method: {
    type: String,
    enum: ["Razorpay", "UPI", "Bank Transfer", "Cheque", "Cash"],
  },
  razorpayOrderId: {
    type: String,
  },
  razorpayPaymentId: {
    type: String,
  },
  razorpaySignature: {
    type: String,
  },
  paidAt: {
    type: Date,
  },
  dueDate: {
    type: Date,
  },
}, {
  timestamps: true,
});

export default mongoose.model("Payment", paymentSchema);
