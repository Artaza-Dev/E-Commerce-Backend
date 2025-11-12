const express = require("express");
const router = express.Router();
const isLoggedIn = require("../middlewares/isLoggedIn")
const { createOrder, getOrders, updateOrderStatus } = require("../controllers/orderController");

router.post("/createorder", isLoggedIn, createOrder);

router.get("/getorder", isLoggedIn, getOrders);

router.put("/updatestatus/:orderId", isLoggedIn, updateOrderStatus);



module.exports = router;
