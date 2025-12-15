import express from "express";
import dotenv from "dotenv";
import cors from "cors"
import connectDB from "./config/db.js";
import userRoutes from "./routers/userRoutes.js";
import productRoutes from './routers/productRoutes.js'
import uploadRoutes from './routers/uploadRoutes.js'
import loginRoutes from './routers/loginRoutes.js'
import whatsappRoutes from './routers/whatsappRoutes.js'
import userDetailsRoutes from './routers/userDetailsRoutes.js'
import orderRoutes from './routers/orderRoutes.js'
import notificationRoutes from "./routers/notificationRoutes.js";
 
import wishlistRoutes from './routers/wishlistRoutes.js'




dotenv.config();



console.log("Loaded Email User:", process.env.EMAIL_USER);
console.log("Loaded Email Pass:", process.env.EMAIL_PASS);


// Connect to MongoDB
connectDB();

const app = express();

app.use(cors())
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/public", express.static("public"));

app.use("/api/users", userRoutes);
app.use("/api/products", productRoutes)
app.use("/api", uploadRoutes);
 
app.use("/api",notificationRoutes)
app.use("/api", loginRoutes)
app.use("/api", whatsappRoutes)
app.use("/api", userDetailsRoutes)
app.use("/api", orderRoutes)
app.use("/api", wishlistRoutes);
 

app.listen(process.env.PORT, () => {
  console.log(`Server started on port ${process.env.PORT}`);
});




