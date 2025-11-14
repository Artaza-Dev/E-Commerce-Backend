const productModel = require("../models/product");
const wishListModel = require("../models/wishlist.js");
const userModel = require("../models/user.js");
const cartModel = require("../models/cart.js");


module.exports.createProduct = async (req, res) => {
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
}

module.exports.fetchProduct = async (req, res) => {
  try {
    const pageNumber = parseInt(req.query.page) || 1;
    const limitNumber = parseInt(req.query.limit) || 4;

    const products = await productModel.paginate({}, {
      page: pageNumber,
      limit: limitNumber,
    });

    res.status(200).json({ products });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

module.exports.getproductById = async (req, res) => {
  try {
    const product = await productModel
      .findOne({ _id: req.params.id })
      .populate({
        path: "variants",
      });
    res.status(200).json({ product });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
}

module.exports.getproductByCategory = async (req, res) => {
  try {
    let category = req.params.category;
    let query = {};
    if (category !== "AllProducts") {
      query.category = category;
    }
    const products = await productModel
      .find(query)
    if (!products.length) {
      return res
        .status(404)
        .json({ message: "No products found in this category" });
    }
    console.log('product by category...', products);
    res.status(200).json({
      message: "Products fetched successfully",
      products,
      count: products.length,
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
}

module.exports.addProductToWishlist = async (req, res) => {
  try {
    const product = await productModel.findById(req.params.productid);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    const user = await userModel.findById(req.user._id);
    // Check if product is already in wishlist
    const alreadyInWishlist = await wishListModel.findOne({
      userId: user._id,
      product: product._id,
    });

    if (alreadyInWishlist) {
      await wishListModel.deleteOne({ _id: alreadyInWishlist._id });
      user.wishlist = user.wishlist.filter(
        (id) => id.toString() !== product._id.toString()
      );
      await user.save();

      return res.json({ message: "Product removed from wishlist" });
    }

    // Add new wishlist item
    const newWishListItem = await wishListModel.create({
      userId: user._id,
      product: product._id,
    });
    user.wishlist.push(product._id);
    await user.save();

    res.json({ message: "Product added to wishlist", item: newWishListItem });
  } catch (error) {
    console.error("Error in wishlist route:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
}

module.exports.getWishlistItems = async (req, res) => {
  try {
    const wishlistItems = await wishListModel
      .find({ userId: req.user._id })
      .populate("product");
    res.status(200).json({ message: "Wishlist items fetch successfully" ,wishlistItems: wishlistItems || [] });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
}

module.exports.addProductToCart = async (req, res) => {
  try {
    console.log('in add to cart', req.body);
    const { productId, variantId, quantity, variantMaxQuantity } = req.body;
    console.log('user in add to cart', req.user);
    
    const userId = req.user._id;

    if (!productId || !variantId || !quantity || !variantMaxQuantity) {
      return res.status(400).json({
        success: false,
        message:
          "Missing required fields (productId, variantId, quantity, variantMaxQuantity)",
      });
    }

    let cart = await cartModel.findOne({ userId });

    if (!cart) {
      cart = await cartModel.create({
        userId,
        items: [{ productId, variantId, quantity }],
      });
      await userModel.findByIdAndUpdate(userId, { cart: cart._id });
      return res.status(200).json({
        success: true,
        message: "Item added to cart successfully",
        cart,
      });
    }

    const existingItem = cart.items.find(
      (item) =>
        item.productId?.toString() === productId?.toString() &&
        item.variantId?.toString() === variantId?.toString()
    );
    if (existingItem) {
      const newQuantity = existingItem.quantity + quantity;

      if (newQuantity > variantMaxQuantity) {
        return res.status(400).json({
          success: false,
          message: `Only ${variantMaxQuantity} items available in stock.`,
        });
      }

      existingItem.quantity = newQuantity;
    } else {
      // Add as new cart item
      if (quantity > variantMaxQuantity) {
        return res.status(400).json({
          success: false,
          message: `Only ${variantMaxQuantity} items available in stock.`,
        });
      }

      cart.items.push({ productId, variantId, quantity });
    }

    // Save updates
    await cart.save();

    res.status(200).json({
      success: true,
      message: existingItem
        ? "Item quantity increased successfully"
        : "New item added to cart",
      cart,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error in add to cart!",
      error: error.message,
    });
  }
}

module.exports.getCartItems = async (req, res) => {
  try {
    const userId = req.user._id;

    // Step 1: Get cart & populate product basic info
    const cart = await cartModel.findOne({ userId }).populate({
      path: "items.productId",
      select: "name baseprice images variants",
    });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "No cart found for this user",
        items: [],
      });
    }

    if (!cart.items || cart.items.length === 0) {
      return res.status(200).json({
        success: true,
        message: "Your cart is empty",
        items: [],
      });
    }

    // Step 2: Loop through each item safely
    const itemsWithVariants = [];

    for (const item of cart.items) {
      const product = item.productId;

      if (!product?._id) {
        console.log(" Product missing for item:", item);
        continue;
      }

      // Ensure product has variants
      const variants = product.variants || [];

      // Find matching variant
      const variant = variants.find(
        (v) => v._id.toString() === item.variantId?.toString()
      );

      itemsWithVariants.push({
        _id: item._id,
        quantity: item.quantity,
        product: {
          _id: product._id,
          name: product.name,
          baseprice: product.baseprice,
          images: product.images,
        },
        variant: variant
          ? {
              _id: variant._id,
              color: variant.color,
              storage: variant?.storage,
              price: variant.price,
              quantity: variant.quantity,
            }
          : null,
      });
    }

    // Send response
    return res.status(200).json({
      success: true,
      message: "Cart items fetched successfully",
      totalCartItems: itemsWithVariants.length,
      items: itemsWithVariants,
    });
  } catch (error) {
    console.error("Error fetching cart items:", error.message);
    res.status(500).json({
      success: false,
      message: "Server error while fetching cart items",
      error: error.message,
    });
  }
}

module.exports.deleteCartItems = async (req, res) => {
  try {
    let itemId = req.params.id;
    let user = req.user;
    let cart = await cartModel.findOne({ userId: user._id });
    const itemExists = cart.items.some(
      (item) => item._id.toString() === itemId
    );

    if (!itemExists) {
      return res.status(404).json({
        success: false,
        message: "Cart item not found",
      });
    }
    cart.items = cart.items.filter((item) => item._id.toString() !== itemId);
    console.log("delete items..", cart.items);
    await cart.save();
    res
      .status(200)
      .json({ success: true, message: "Cart item deleted successfully", cart: cart });
  } catch (error) {
    res
      .status(500)
      .json({
        success: false,
        message: "Server error while fetching cart items",
        error: error.message,
      });
  }
}

module.exports.orderSummery = async (req, res) => {
  try {
    const userId = req.user._id;
    const { items } = req.body;

    const summary = await SummaryModel.create({
      user: userId,
      items,
      createdAt: new Date(),
    });

    res.status(200).json({ success: true, data: summary });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

module.exports.productReview = async (req, res) => {
  try {
    let user = req.user;
    const { productId, rating, comment } = req.body;
    if (!productId || !rating || !comment) {
      return res.status(400).json({
        success: false,
        message: "Product ID, rating, and comment are required.",
      });
    }

    let authUser = await userModel.findOne({ _id: user._id });
    if (!authUser) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });      
    }
    let product = await productModel.findById(productId);
    if(!product){
      return res.status(404).json({
        success: false,
        message: "Product not found.",
      }); 
    }

    let existingReviewIndex = product.reviews.findIndex((rev)=> rev.user.toString() ===  authUser._id.toString());
    if(existingReviewIndex !== -1){
      product.reviews[existingReviewIndex].rating = rating;
      product.reviews[existingReviewIndex].comment = comment;
    }else{
      const newReview ={
        user: authUser._id,
        name: authUser.username,
        rating: Number(rating),
        comment,
      }
      product.reviews.push(newReview);
    }

    product.numOfReviews = product.reviews.length;
    product.ratings =
      product.reviews.reduce((acc, item) => item.rating + acc, 0)
      product.reviews.length;

    await product.save({ validateBeforeSave: false });

    res.status(200).json({
      success: true,
      message: "Review submitted successfully.",
      product,
    });


  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};