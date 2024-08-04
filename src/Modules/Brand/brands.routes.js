import { Router } from "express";
// controllers
import * as controller from "./brands.controller.js";
// middlewares
import * as Middlewares from "../../Middlewares/index.js";
// models
import { Brand } from "../../../DB/Models/index.js";
// utils
import { extensions } from "../../Utils/index.js";

const brandRouter = Router();
const { errorHandler, multerHost, getDocumentByName } = Middlewares;

brandRouter.post(
  "/create",
  multerHost({ allowedExtensions: extensions.Images }).single("image"),
  getDocumentByName(Brand),
  errorHandler(controller.createBrand)
);

brandRouter.get("/", errorHandler(controller.getBrands));

brandRouter.put(
  "/update/:_id",
  multerHost({ allowedExtensions: extensions.Images }).single("image"),
  errorHandler(controller.updatebrand)
);

brandRouter.delete("/delete/:_id", errorHandler(controller.deleteBrand));

export { brandRouter };
