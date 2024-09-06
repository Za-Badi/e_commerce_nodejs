import { json } from "express";
import cors  from "cors";
import * as router from "./src/Modules/index.js";
import { globaleResponse } from "./src/Middlewares/index.js";
import { mainSchema } from "./src/GraphQL/Schema/index.js";
import { createHandler } from "graphql-http/lib/use/express";
import { login } from "./src/Modules/User/user.controller.js";

export const routerHandler = (app) => {
  app.use(cors());
  app.use(json());

  app.use("/graphql", createHandler({
    schema: mainSchema,
    context: req => ({
      ip: req.raw.ip,
      headers: req.headers,
    }),
    
  }));

  app.use("/categories", router.categoryRouter);
  app.use("/sub-categories", router.subCategoryRouter);
  app.use("/brands", router.brandRouter);
  app.use("/products", router.productRouter);
  app.use("/user", router.userRouter);
  app.use("/addresses", router.addressRouter);
  app.use("/cart", router.cartRouter);
  app.use("/coupon", router.couponRouter);
  app.use("/order", router.orderRouter);
  app.use("/review", router.reviewRouter);
  app.use("*", (req, res) => res.status(404).json("Not Found"));

  app.use(globaleResponse);
};
