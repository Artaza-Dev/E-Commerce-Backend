const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const productRouter = require("./routes/productRouter");
const userRouter = require("./routes/userRouter")
const cookieParser = require("cookie-parser");
// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Middlewares
app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
// Default Route
app.use("/user", userRouter)
app.use("/product", productRouter);

// Database Connection
mongoose
  .connect(process.env.MONGO_URL)
  .then(() => console.log("MongoDB Connected Successfully"))
  .catch((err) => console.error("MongoDB Connection Error:", err));

// Start Server
app.listen(port, () => console.log(`Server running on port ${port}`));
