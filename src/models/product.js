const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");


const variantSchema = new mongoose.Schema({
  color: { type: String },
  ram: { type: String },
  storage: { type: String },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true },
});


const reviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: { type: String, required: true },
    rating: { type: Number, required: true },
    comment: { type: String, required: true },
  },
  { timestamps: true }
);


const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    brand: { type: String },
    category: { type: String, enum:["Smartphone" ,"Laptop" ,"Tablet" ,"Smartwatch" ,"Headphone" ], required: true },
    baseprice: { type: Number },
    description: { type: String },
    images: [{ type: String }],

    specs: { type: mongoose.Schema.Types.Mixed },
    variants: [variantSchema],


    reviews: [reviewSchema],
    ratings: {
      type: Number,
      default: 0,
    },
    numOfReviews: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

productSchema.plugin(mongoosePaginate);

module.exports = mongoose.model("Product", productSchema);
