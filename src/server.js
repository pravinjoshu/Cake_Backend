import express from "express";
import dotenv from "dotenv";
import cors from "cors";

import connectDB from "./config/db.js";

import userRoutes from "./routers/userRoutes.js";
import productRoutes from "./routers/productRoutes.js";
import uploadRoutes from "./routers/uploadRoutes.js";
import loginRoutes from "./routers/loginRoutes.js";
import whatsappRoutes from "./routers/whatsappRoutes.js";
import userDetailsRoutes from "./routers/userDetailsRoutes.js";
import orderRoutes from "./routers/orderRoutes.js";
import notificationRoutes from "./routers/notificationRoutes.js";
import couponRoutes from "./routers/couponRoutes.js";
import scratchCardRouter from "./routers/scratchCardRouter.js";
import prizePoolRoutes from "./routers/prizePoolRoutes.js";
import wishlistRoutes from "./routers/wishlistRoutes.js";
import reviewRoutes from "./routers/reviewRoutes.js";
import cartRoutes from "./routers/cartRoutes.js";
import bannerRoutes from "./routers/bannerRoutes.js";

dotenv.config();

// DB connect (IMPORTANT: function safe-a irukkanum)
connectDB();

const PORT = process.env.PORT || 5000;

const app = express();

// ✅ CORS
app.use(cors());


app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// static files
app.use("/public", express.static("public"));
app.use("/review", express.static("public/review"));
app.use("/banner", express.static("public/banner"));

// test route
app.get("/", (req, res) => {
  res.send("Backend working");
});

// API routes
app.use("/api/users", userRoutes);
app.use("/api/products", productRoutes);
app.use("/api", uploadRoutes);
app.use("/api", notificationRoutes);
app.use("/api", loginRoutes);
app.use("/api", whatsappRoutes);
app.use("/api", userDetailsRoutes);
app.use("/api", orderRoutes);
app.use("/api", couponRoutes);
app.use("/api", wishlistRoutes);
app.use("/api/scratchcards", scratchCardRouter);
app.use("/api/admin/prize-pools", prizePoolRoutes);
app.use("/api", reviewRoutes);
app.use("/api", cartRoutes);
app.use("/api", bannerRoutes);

 
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
