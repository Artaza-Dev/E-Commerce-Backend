const mongoose = require("mongoose");

const variantSchema = new mongoose.Schema({
  price: {
    type: Number,
    required: [true, "Price is required"],
    min: [0, "Price cannot be negative"],
  },
  quantity: {
    type: Number,
    required: [true, "Quantity is required"],
    min: [0, "Quantity cannot be negative"],
  },
  colors: {
    type: String,
    required: [true, "Color is required"],
  },
  description: {
    type: String,
  },
  images: {
    type: String,
  },
  attributes: [{
    key: String,
    value: String,
  }]
});

module.exports = mongoose.model("Variant", variantSchema);
