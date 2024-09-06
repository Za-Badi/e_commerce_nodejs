import { Router } from "express";
// controllers
import * as controller from "./address.controller.js";
// middlewares
import * as Middlewares from "../../Middlewares/index.js";
// models

export const addressRouter = Router();
const { errorHandler, auth } = Middlewares;

// addressRouter
//     .route("/")
//     .get(auth, errorHandler(controller.getAddresses))
//     .post(auth, errorHandler(controller.addAddress));
    addressRouter.get("/all",auth(), errorHandler(controller.getAddresses));
    addressRouter.post("/",auth(), errorHandler(controller.addAddress));
    addressRouter.delete("/:addressId",auth(), errorHandler(controller.deleteAddress));
    addressRouter.put("/:addressId",auth(), errorHandler(controller.editAddress));
// export {addressRouter};