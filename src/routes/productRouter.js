const express = require("express");
const router = express.Router();
const uploads = require("../config/multer-config");
const isLoggedIn = require("../middlewares/isLoggedIn.js");
const { createProduct, fetchProduct, getproductById, getproductByCategory, addProductToWishlist, getWishlistItems, addProductToCart, getCartItems, deleteCartItems, orderSummery } = require("../controllers/productController.js");


// Create a new product
router.post("/createproduct", uploads.array("images", 3), createProduct);

// Get all products with their variants
router.get("/fetchproducts", fetchProduct);

// Get product in product details page by ID
router.get("/getproduct/:id", getproductById);

// get products by category
router.get("/getproductsbycategory/:category", getproductByCategory);

router.get("/addtowishlist/:productid", isLoggedIn, addProductToWishlist);

// get wishlist items for logged in user
router.get("/getwishlist", isLoggedIn, getWishlistItems);
 
// add to cart route
router.post("/addtocart", isLoggedIn, addProductToCart);

router.get("/cartitems", isLoggedIn, getCartItems);

router.get("/deletecartitems/:id", isLoggedIn, deleteCartItems);

router.post("/summary", isLoggedIn, orderSummery)

module.exports = router;
