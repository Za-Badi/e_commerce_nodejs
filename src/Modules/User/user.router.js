import { Router } from "express";
import * as controller from "./user.controller.js";
import * as Middlewares from "../../Middlewares/index.js";

export const userRouter = Router() 
const { errorHandler } = Middlewares;;

userRouter.post("/register", errorHandler(controller.registerUser));
userRouter.put("/update/:id", errorHandler(controller.updateAccount));
userRouter.post("/login", errorHandler(controller.login));
userRouter.post("/confirm-email", errorHandler(controller.confirmEmail));
userRouter.post("/loginwithgmail", errorHandler(controller.loginWIthGmail));
userRouter.post("/signupwithgmail", errorHandler(controller.signUpWIthGmail));