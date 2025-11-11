const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  variantId: { type: mongoose.Schema.Types.ObjectId },
  name: {type: String},
  image:{type: String},
  quantity: { type: Number, required: true },
  color: {type: String, required: true},
  price: { type: Number, required: true },
});

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    items: [orderItemSchema],
    shippingAddress: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    totalAmount: { type: Number, required: true },
    discountAmount: { type: Number, default: 0 },
    paymentMethod: { type: String, enum: ["COD"], default: "COD" },
    deliveryDate: {
      type: Date,
      default: () => {
        const date = new Date();
        date.setDate(date.getDate() + 4);
        return date;
      },
    },
    status: {
      type: String,
      enum: ["Placed", "Processing", "Shipped", "Delivered", "Cancelled"],
      default: "Placed",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
