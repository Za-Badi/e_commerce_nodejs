import { Router } from "express";
// controllers
import * as controller from "./cart.controller.js";
// middlewares
import * as Middlewares from "../../Middlewares/index.js";
// models

export const cartRouter = Router();
const { errorHandler, auth } = Middlewares;

// addressRouter
//     .route("/")
//     .get(auth, errorHandler(controller.getAddresses))
//     .post(auth, errorHandler(controller.addAddress));
cartRouter.get("/",auth(), errorHandler(controller.getCart));
cartRouter.put("/update/:productId",auth(), errorHandler(controller.updateCart));
cartRouter.post("/add/:productId",auth(), errorHandler(controller.addToCart));
cartRouter.put("/remove/:productId",auth(), errorHandler(controller.removeFromCart));
