import Tenant from "../models/Tenant.js";

// @desc    Get all tenants
// @route   GET /api/tenants
// @access  Private (Owner/Manager)
export const getTenants = async (req, res) => {
  try {
    const tenants = await Tenant.find({ owner: req.user.id }).populate("user", "name email phone").populate("property", "title address");
    res.status(200).json({ success: true, data: tenants });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Add tenant
// @route   POST /api/tenants
// @access  Private (Owner only)
export const addTenant = async (req, res) => {
  try {
    req.body.owner = req.user.id;
    const tenant = await Tenant.create(req.body);
    res.status(201).json({ success: true, message: "Tenant added", data: tenant });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get tenant details
// @route   GET /api/tenants/:id
// @access  Private
export const getTenant = async (req, res) => {
  try {
    const tenant = await Tenant.findById(req.params.id).populate("user property");
    if (!tenant) return res.status(404).json({ success: false, message: "Tenant not found" });
    res.status(200).json({ success: true, data: tenant });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update tenant
// @route   PUT /api/tenants/:id
// @access  Private
export const updateTenant = async (req, res) => {
  try {
    let tenant = await Tenant.findById(req.params.id);
    if (!tenant) return res.status(404).json({ success: false, message: "Tenant not found" });
    
    tenant = await Tenant.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    res.status(200).json({ success: true, message: "Tenant updated", data: tenant });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Remove tenant
// @route   DELETE /api/tenants/:id
// @access  Private (Owner only)
export const deleteTenant = async (req, res) => {
  try {
    const tenant = await Tenant.findById(req.params.id);
    if (!tenant) return res.status(404).json({ success: false, message: "Tenant not found" });
    
    await Tenant.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: "Tenant removed", data: {} });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
