const mongoose = require("mongoose");
const wishlist = require("./wishlist");

const variantSchema = new mongoose.Schema({
  color: { type: String },
  ram: { type: String },
  storage: { type: String },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true },
});

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    brand: { type: String },
    category: { type: String, required: true },
    baseprice: { type: Number },
    description: {
      type: String,
    },
    images: [{ type: String }],
    specs:{ type: mongoose.Schema.Types.Mixed },
    variants: [variantSchema],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Product", productSchema);
