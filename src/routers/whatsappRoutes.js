import express from "express";
import { whatsapp } from "../controllers/whatsappController.js";

const router = express.Router();

router.post("/send", whatsapp);
 

export default router;