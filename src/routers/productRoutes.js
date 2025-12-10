import express from "express";
import { createProduct, getProducts, getProductById,updateProductById, deleteProductById } from "../controllers/productController.js";
import { verifyToken } from "../middleware/authMiddleware.js";


const router = express.Router();

router.post("/",verifyToken, createProduct);                // CREATE
router.get("/", getProducts);                   // GET ALL
router.get("/:id", getProductById);             // GET ONE
router.put("/:id",verifyToken, updateProductById);       // UPDATE ONE
router.delete("/:id",verifyToken, deleteProductById);       // DELETE ONE
 


export default router;
