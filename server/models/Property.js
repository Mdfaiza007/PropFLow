import mongoose from "mongoose";

const propertySchema = new mongoose.Schema({
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
    required: [true, "Please add a property title"],
  },
  address: {
    type: String,
    required: [true, "Please add an address"],
  },
  city: {
    type: String,
  },
  state: {
    type: String,
  },
  pincode: {
    type: String,
  },
  type: {
    type: String,
    enum: ["Apartment", "Villa", "Commercial", "Studio"],
    default: "Apartment",
  },
  rent: {
    type: Number,
    required: [true, "Please add rent amount"],
  },
  deposit: {
    type: Number,
  },
  bedrooms: {
    type: Number,
  },
  bathrooms: {
    type: Number,
  },
  area: {
    type: Number,
  },
  photos: {
    type: [String],
  },
  status: {
    type: String,
    enum: ["Vacant", "Occupied"],
    default: "Vacant",
  },
  amenities: {
    type: [String],
  },
  description: {
    type: String,
  },
}, {
  timestamps: true,
});

export default mongoose.model("Property", propertySchema);
