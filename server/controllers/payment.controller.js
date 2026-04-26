import Payment from "../models/Payment.js";
import razorpay from "../config/razorpay.js";
import crypto from "crypto";

// @desc    Get all payments
// @route   GET /api/payments
// @access  Private (Role-based)
export const getPayments = async (req, res) => {
  try {
    let query;
    if (req.user.role === "owner" || req.user.role === "manager") {
      query = Payment.find({ owner: req.user.id });
    } else {
      query = Payment.find({ tenant: req.user.id });
    }
    const payments = await query.populate("tenant property lease");
    res.status(200).json({ success: true, data: payments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create Razorpay order
// @route   POST /api/payments/create-order
// @access  Private
export const createOrder = async (req, res) => {
  try {
    const { amount, tenantId, propertyId, month } = req.body;
    
    const options = {
      amount: amount * 100, // amount in the smallest currency unit (paise)
      currency: "INR",
      receipt: `rent_${Date.now()}`,
      notes: { tenantId, propertyId, month }
    };
    
    const order = await razorpay.orders.create(options);
    res.status(200).json({ success: true, order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Verify payment
// @route   POST /api/payments/verify-payment
// @access  Private
export const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, paymentData } = req.body;
    
    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(sign.toString())
      .digest("hex");
      
    if (razorpay_signature === expectedSign) {
      // Create payment record in database
      const payment = await Payment.create({
        ...paymentData,
        status: "Paid",
        method: "Razorpay",
        razorpayOrderId: razorpay_order_id,
        razorpayPaymentId: razorpay_payment_id,
        razorpaySignature: razorpay_signature,
        paidAt: Date.now()
      });
      
      return res.status(200).json({ success: true, message: "Payment verified successfully", data: payment });
    } else {
      return res.status(400).json({ success: false, message: "Invalid signature sent!" });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get revenue stats
// @route   GET /api/payments/stats
// @access  Private (Owner only)
export const getStats = async (req, res) => {
  try {
    const stats = await Payment.aggregate([
      { $match: { owner: req.user._id, status: "Paid" } },
      { $group: { _id: "$month", totalRevenue: { $sum: "$amount" } } }
    ]);
    res.status(200).json({ success: true, data: stats });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Mark paid manually
// @route   PUT /api/payments/:id/manual
// @access  Private (Owner/Manager)
export const markPaidManual = async (req, res) => {
  try {
    const { method } = req.body;
    const payment = await Payment.findByIdAndUpdate(
      req.params.id,
      { status: "Paid", method: method || "Cash", paidAt: Date.now() },
      { new: true }
    );
    res.status(200).json({ success: true, message: "Payment marked as paid", data: payment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
