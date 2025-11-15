const userModel = require("../models/user");
const orderModel = require("../models/order");
const productModel = require("../models/product");
const cartModel = require("../models/cart");

module.exports.createOrder = async (req, res) => {
  try {
    let user = req.user;
    let { discountAmount, items, paymentMethod, shippingAddress, totalAmount } =
      req.body;

    let authUser = await userModel.findOne({ _id: user._id });
    if (!authUser) {
      return res.status(401).json({ message: "Unauthorized User" });
    }
    let newOrder = await orderModel.create({
      userId: user._id,
      items,
      totalAmount,
      discountAmount,
      shippingAddress,
      paymentMethod,
    });

    if(!newOrder){
      return res.status(400).json({message: "Error to create order"})
    }

    for (const item of newOrder.items) {
        const product = await productModel.findById(item.productId);
        if (!product) continue;

        const variant = product.variants.id(item.variantId);
        if (variant) {
          variant.quantity = Math.max(0, variant.quantity - item.quantity);
        }
        await product.save();
      }

    if (authUser.cart) {
      await cartModel.findByIdAndDelete(authUser.cart);
      authUser.cart = null;
    }

    authUser.orders.push(newOrder._id);
    await authUser.save();

    res.status(201).json({
      success: true,
      message: "Order placed successfully!",
      order: newOrder,
    });

  } catch (error) {
    console.error("Error creating address:", error);
    res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

module.exports.getOrders = async (req, res) => {
  try {
    const user = req.user;
    const userOrders = await userModel
      .findOne({ _id: user._id })
      .populate("orders")
      .lean();

    if (!userOrders) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      success: true,
      message: "Orders fetched successfully",
      orders: userOrders.orders,
    });
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

module.exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const { orderId } = req.params;

    const validStatuses = ["Placed", "Processing", "Shipped", "Delivered"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid order status" });
    }

    const order = await orderModel.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    order.status = status;
    await order.save();

    // if (status === "Shipped") {
    //   for (const item of order.items) {
    //     const product = await productModel.findById(item.productId);
    //     if (!product) continue;

    //     const variant = product.variants.id(item.variantId);
    //     if (variant) {
    //       variant.quantity = Math.max(0, variant.quantity - item.quantity);
    //     }

    //     await product.save();
    //   }
    // }

    res.status(200).json({
      success: true,
      message: `Order status updated to ${status}`,
      order,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};


