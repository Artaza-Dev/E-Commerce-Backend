const express = require("express");
const router = express.Router();
const productModel = require("../models/product");
const variantModel = require("../models/variants");
const uploads = require("../config/multer-config");

// Create a new product
router.post("/createproduct", async (req, res) => {
  try {
    let { name, brand, category } = req.body;
    const product = await productModel.findOne({ name });
    if (product) {
      return res.status(400).json({ message: "Product already exists" });
    }
    const newProduct = await productModel.create({
      name,
      brand,
      category,
    });
    res
      .status(201)
      .json({ message: "Product created successfully", product: newProduct });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});
// Add a variant to an existing product
router.post("/addvariant", uploads.single("images"), async (req, res) => {
  try {
    console.log("variant route chla..", req.body);
    let {
      name,
      category,
      price,
      quantity,
      colors,
      description,
    } = req.body;
    const product = await productModel.findOne({ name, category });
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    const newVariant = await variantModel.create({
      name,
      category,
      price,
      quantity,
      colors,
      description,
      images: req.file.path,
      attributes: JSON.parse(req.body.attributes || "{}"),
    });
    product.variants.push({ variantId: newVariant._id });
    await product.save();
    res
      .status(201)
      .json({ message: "Variant added successfully", variant: newVariant });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});

// Get all products with their variants

router.get("/fetchproducts", async (req, res) => {
  try {
    const products = await productModel.find({},{ name: 1 }).populate({path:"variants.variantId", select: "price",});
    console.log(products);
    
    res.status(200).json({ products });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }})

module.exports = router;
