const mongoose = require("mongoose");

const addressSchema = new mongoose.Schema(
   {
      fullName: String,
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
