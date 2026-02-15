import express from 'express';
import { chatBot } from '../controllers/chatBotController.js';
 

const router = express.Router();
 
router.post("/chatBot", chatBot)

export default router;