import jwt from "jsonwebtoken";
import { User } from "../../../DB/Models/index.js";

export const isAuthQL = async (token) => {
  try {
    if (!token) {
      return new Error("Token is required, Please Login First", {
        cause: 400,
      });
    }
    const data = jwt.verify(token, process.env.LOGIN_SECRET);
    console.log("data ", data);
    // check if token payload has userId
    if (!data?.userId) {
      return new Error("Invalid token ", { cause: 400 });
    }

    // find user by userId
    const isUserExists = await User.findById(data?.userId);
    if (!isUserExists) {
      return new Error("User not found, Please Sign up first", { cause: 404 });
    }

    return {
      code: 200,
      isUserExists,
    };
  } catch (error) {
    return new Error("invalid token", { cause: 500 });
  }
};
