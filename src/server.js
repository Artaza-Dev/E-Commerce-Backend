const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const productRouter = require("./routes/productRouter");
// Load environment variables
dotenv.config({ path: "../.env" });

const app = express();
const port = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// Default Route
app.use("/product", productRouter);



// Database Connection
mongoose
  .connect(process.env.MONGO_URL)
  .then(() => console.log("MongoDB Connected Successfully"))
  .catch((err) => console.error("MongoDB Connection Error:", err));

// Start Server
app.listen(port, () => console.log(`Server running on port ${port}`));
