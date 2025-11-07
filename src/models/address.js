// models/Address.js
const mongoose = require("mongoose");

const addressSchema = new mongoose.Schema(
   {
      email: { type: String, required: true },
      address: String,
      city: String,
      state: String,
      zip: String,
      country: String,
      phone: String,
      isDefault: { type: Boolean, default: false },
    },
  { timestamps: true }
);

module.exports = mongoose.model("Address", addressSchema);
