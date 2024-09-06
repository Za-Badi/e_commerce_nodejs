import { Router } from "express";
// controllers
import * as controller from "./review.controller.js";
// middlewares
import * as Middlewares from "../../Middlewares/index.js";

const { errorHandler, auth} = Middlewares;

const reviewRouter = Router();
reviewRouter.post("/", auth(), errorHandler(controller.addReview))
.get("/", auth(["Admin"]), errorHandler(controller.listReviews))
.put("/:reviewId", auth(["Admin"]), errorHandler(controller.approveOrRejectReview));

export { reviewRouter };
