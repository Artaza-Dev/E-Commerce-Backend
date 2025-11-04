const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["admin", "customer"], default: "customer" },
  addresses: [
    {
      address: String,
      city: String,
      state: String,
      zip: String,
      country: String,
      phone: String,
      isDefault: { type: Boolean, default: false },
    },
  ],
  coupons: [
    {
      couponId: { type: mongoose.Schema.Types.ObjectId, ref: "Coupon" },
    },
  ],
  wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
  cart: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
      quantity: { type: Number, default: 1 },
      variantId: { type: mongoose.Schema.Types.ObjectId, ref: "Variant" },
    },
  ],
});

module.exports = mongoose.model("User", userSchema);
