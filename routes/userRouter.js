import express from "express";
import { changePassword, getCurrentUser, googleLogin, loginUser, saveUser, sentOTP } from "../controllers/userController.js";

const userRouter = express.Router();

userRouter.post("/", saveUser);
userRouter.post("/login",loginUser);
userRouter.post("/google",googleLogin);
userRouter.get("/current",getCurrentUser);
userRouter.post("/sendMail", sentOTP);
userRouter.post("/resetPassword", changePassword);
export default userRouter;