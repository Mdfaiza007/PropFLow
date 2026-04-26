import Lease from "../models/Lease.js";
import Property from "../models/Property.js";

// @desc    Get all leases
// @route   GET /api/leases
// @access  Private (Role-based)
export const getLeases = async (req, res) => {
  try {
    let query;
    if (req.user.role === "owner") {
      query = Lease.find({ owner: req.user.id });
    } else if (req.user.role === "manager") {
      const properties = await Property.find({ manager: req.user.id }).select("_id");
      const propertyIds = properties.map(p => p._id);
      query = Lease.find({ property: { $in: propertyIds } });
    } else {
      query = Lease.find({ tenant: req.user.id });
    }
    const leases = await query.populate("property tenant owner");
    res.status(200).json({ success: true, data: leases });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create lease
// @route   POST /api/leases
// @access  Private (Owner/Manager)
export const createLease = async (req, res) => {
  try {
    const property = await Property.findById(req.body.property);
    if (!property) return res.status(404).json({ success: false, message: "Property not found" });
    
    req.body.owner = property.owner;
    const lease = await Lease.create(req.body);
    res.status(201).json({ success: true, message: "Lease created", data: lease });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get lease details
// @route   GET /api/leases/:id
// @access  Private
export const getLease = async (req, res) => {
  try {
    const lease = await Lease.findById(req.params.id).populate("property tenant owner");
    if (!lease) return res.status(404).json({ success: false, message: "Lease not found" });
    res.status(200).json({ success: true, data: lease });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update lease
// @route   PUT /api/leases/:id
// @access  Private
export const updateLease = async (req, res) => {
  try {
    let lease = await Lease.findById(req.params.id);
    if (!lease) return res.status(404).json({ success: false, message: "Lease not found" });
    
    lease = await Lease.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    res.status(200).json({ success: true, message: "Lease updated", data: lease });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Sign lease
// @route   PUT /api/leases/:id/sign
// @access  Private
export const signLease = async (req, res) => {
  try {
    const lease = await Lease.findByIdAndUpdate(
      req.params.id,
      { signed: true, signedAt: Date.now(), status: "Active" },
      { new: true }
    );
    res.status(200).json({ success: true, message: "Lease signed", data: lease });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete lease
// @route   DELETE /api/leases/:id
// @access  Private (Owner only)
export const deleteLease = async (req, res) => {
  try {
    const lease = await Lease.findById(req.params.id);
    if (!lease) return res.status(404).json({ success: false, message: "Lease not found" });
    
    await Lease.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: "Lease deleted", data: {} });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
// @desc    Upload lease document
// @route   POST /api/leases/:id/document
// @access  Private (Owner/Manager)
export const uploadDocument = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "Please upload a document" });
    }
    
    const documentUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    
    const lease = await Lease.findByIdAndUpdate(
      req.params.id,
      { documentUrl },
      { new: true }
    );
    
    res.status(200).json({ success: true, message: "Document uploaded", data: lease });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
