import MaintenanceRequest from "../models/MaintenanceRequest.js";
import Property from "../models/Property.js";

// @desc    Get all requests
// @route   GET /api/maintenance
// @access  Private (Role-based)
export const getRequests = async (req, res) => {
  try {
    let query;
    if (req.user.role === "tenant") {
      query = MaintenanceRequest.find({ tenant: req.user.id });
    } else if (req.user.role === "manager") {
      const properties = await Property.find({ manager: req.user.id }).select("_id");
      const propertyIds = properties.map(p => p._id);
      query = MaintenanceRequest.find({ property: { $in: propertyIds } });
    } else {
      query = MaintenanceRequest.find({ owner: req.user.id });
    }
    const requests = await query.populate("property tenant");
    res.status(200).json({ success: true, data: requests });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Submit request
// @route   POST /api/maintenance
// @access  Private (Tenant only)
export const submitRequest = async (req, res) => {
  try {
    const { title, propertyId, priority, description } = req.body;
    
    const property = await Property.findById(propertyId);
    if (!property) {
      return res.status(404).json({ success: false, message: "Property not found" });
    }
    
    let imageUrls = [];
    if (req.files && req.files.length > 0) {
      imageUrls = req.files.map(file => {
        return `${req.protocol}://${req.get('host')}/uploads/${file.filename}`;
      });
    }
    
    const request = await MaintenanceRequest.create({
      title,
      property: propertyId,
      priority,
      description,
      tenant: req.user.id,
      owner: property.owner,
      photos: imageUrls
    });
    
    res.status(201).json({ success: true, message: "Request submitted", data: request });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get details
// @route   GET /api/maintenance/:id
// @access  Private
export const getRequest = async (req, res) => {
  try {
    const request = await MaintenanceRequest.findById(req.params.id).populate("property tenant");
    if (!request) return res.status(404).json({ success: false, message: "Request not found" });
    res.status(200).json({ success: true, data: request });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update status
// @route   PUT /api/maintenance/:id/status
// @access  Private (Owner/Manager)
export const updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const request = await MaintenanceRequest.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    res.status(200).json({ success: true, message: "Status updated", data: request });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Assign vendor
// @route   PUT /api/maintenance/:id/assign
// @access  Private (Owner/Manager)
export const assignVendor = async (req, res) => {
  try {
    const { vendor, vendorPhone, estimatedCost } = req.body;
    const request = await MaintenanceRequest.findByIdAndUpdate(
      req.params.id,
      { vendor, vendorPhone, estimatedCost, status: "Assigned" },
      { new: true }
    );
    res.status(200).json({ success: true, message: "Vendor assigned", data: request });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete request
// @route   DELETE /api/maintenance/:id
// @access  Private
export const deleteRequest = async (req, res) => {
  try {
    await MaintenanceRequest.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: "Request deleted", data: {} });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
