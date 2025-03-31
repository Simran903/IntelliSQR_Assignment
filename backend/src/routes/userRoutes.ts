import express from "express";
import { loginUser, registerUser } from "../controllers/userController";

const router = express.Router();

router.post("/register", registerUser as any);
router.post("/login", loginUser as any);

export default router;