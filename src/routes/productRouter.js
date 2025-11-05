const express = require("express");
const router = express.Router();
const productModel = require("../models/product");
const uploads = require("../config/multer-config");
const isLoggedIn = require("../middlewares/isLoggedIn.js");
const wishListModel = require("../models/wishlist.js");
const userModel = require("../models/user.js");

// Create a new product
router.post("/createproduct", uploads.array("images", 3), async (req, res) => {
  try {
    let { name, brand, category, baseprice, description, specs, variants } =
      req.body;
    const product = await productModel.findOne({ name });
    if (product) {
      return res.status(400).json({ message: "Product already exists" });
    }
    const imageUrls = req.files?.map((file) => file.path) || [];

    let parsedSpecs = {};
    try {
      parsedSpecs = specs ? JSON.parse(specs) : {};
    } catch {
      parsedSpecs = {};
    }

    const newProduct = await productModel.create({
      name,
      brand,
      category,
      baseprice,
      description,
      images: imageUrls,
      specs: parsedSpecs,
      variants: JSON.parse(variants || "[]"),
    });
    res
      .status(201)
      .json({ message: "Product created successfully", product: newProduct });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});

// Get all products with their variants
router.get("/fetchproducts", async (req, res) => {
  try {
    const products = await productModel
      .find({})

    res.status(200).json({ products });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});

// Get product in product details page by ID
router.get("/getproduct/:id", async (req, res) => {
  try {
    const product = await productModel
      .findOne({ _id: req.params.id })
      .populate({
        path: "variants",
      });
    console.log("product details backend..", product.variants[0].attributes);
    res.status(200).json({ product });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});

// get products by category
router.get("/getproductsbycategory/:category", async (req, res) => {
  try {
    let category = req.params.category;
    let query = {};
    if (category !== "all") {
      query.category = category;
    }
    const products = await productModel
      .find(query)
      .populate({ path: "variants.variantId" });
    if (!products.length) {
      return res
        .status(404)
        .json({ message: "No products found in this category" });
    }
    res.status(200).json({
      message: "Products fetched successfully",
      products,
      count: products.length,
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});
// add to product to wishList
router.get("/addtowishlist/:productid",async (req, res) => {
  let product = await productModel.findOne({_id:req.params.productid});
  let user = await userModel.findOne({_id:"69097b2935ccfda29f657601"});
  let wishListItem = await wishListModel.create({
    userId: user._id,
    product: product._id
  })
  user.wishlist.push(product._id);
  await user.save();

  res.json({ message: "Wishlist route working", user: req.user });
});

module.exports = router;
