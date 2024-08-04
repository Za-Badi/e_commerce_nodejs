import { Router } from "express";
// controllers
import * as controller from "./products.controller.js";
// middlewares
import * as Middlewares from "../../Middlewares/index.js";
// utils
import { extensions } from "../../Utils/index.js";
import { Brand } from "../../../DB/Models/brand.model.js";
// models
// import { Brand } from "../../../DB/Models/index.js";

const productRouter = Router();
const { errorHandler, multerHost, checkIfIdsExit } = Middlewares;

productRouter.post(
  "/add",
  multerHost({ allowedExtensions: extensions.Images }).array("image", 5),
  checkIfIdsExit(Brand),
  errorHandler(controller.addProduct)
);

productRouter.put("/update/:productId",
    multerHost({ allowedExtensions: extensions.Images }).array("image", 5), 
    errorHandler(controller.updateProduct));
productRouter.delete(
        "/delete/:_id",
        // checkIfIdsExit(Brand),
        errorHandler(controller.deleteProduct)
      );

productRouter.get("/list", errorHandler(controller.listProducts));
export { productRouter };
