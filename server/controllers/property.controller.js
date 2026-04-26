import Property from "../models/Property.js";

// @desc    Get all properties
// @route   GET /api/properties
// @access  Private
export const getProperties = async (req, res) => {
  try {
    let query;
    if (req.user.role === "owner") {
      query = Property.find({ owner: req.user.id });
    } else if (req.user.role === "manager") {
      query = Property.find({ manager: req.user.id });
    } else {
      query = Property.find();
    }
    const properties = await query.populate("manager");
    res.status(200).json({ success: true, data: properties });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create property
// @route   POST /api/properties
// @access  Private (Owner only)
export const createProperty = async (req, res) => {
  try {
    req.body.owner = req.user.id;
    const property = await Property.create(req.body);
    res.status(201).json({ success: true, message: "Property created", data: property });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single property
// @route   GET /api/properties/:id
// @access  Private
export const getProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id).populate("manager");
    if (!property) return res.status(404).json({ success: false, message: "Property not found" });
    res.status(200).json({ success: true, data: property });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update property
// @route   PUT /api/properties/:id
// @access  Private (Owner only)
export const updateProperty = async (req, res) => {
  try {
    let property = await Property.findById(req.params.id);
    if (!property) return res.status(404).json({ success: false, message: "Property not found" });
    
    if (property.owner.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Not authorized to update this property" });
    }
    
    property = await Property.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    res.status(200).json({ success: true, message: "Property updated", data: property });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete property
// @route   DELETE /api/properties/:id
// @access  Private (Owner only)
export const deleteProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) return res.status(404).json({ success: false, message: "Property not found" });
    
    if (property.owner.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Not authorized to delete this property" });
    }
    
    await Property.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: "Property deleted", data: {} });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Upload photos
// @route   POST /api/properties/:id/photos
// @access  Private (Owner only)
export const uploadPhotos = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, message: "Please upload image(s)" });
    }
    
    const imageUrls = req.files.map(file => {
      // Local disk storage returns filename, not a full url like cloudinary
      return `${req.protocol}://${req.get('host')}/uploads/${file.filename}`;
    });
    const property = await Property.findByIdAndUpdate(
      req.params.id,
      { $push: { photos: { $each: imageUrls } } },
      { new: true }
    );
    
    res.status(200).json({ success: true, message: "Photos uploaded", data: property });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete photo
// @route   DELETE /api/properties/:id/photos
// @access  Private (Owner only)
export const deletePhoto = async (req, res) => {
  res.status(200).json({ success: true, message: "Delete photo route (To be implemented)" });
};
