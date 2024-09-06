// import { ErrorClass } from "../Utils/index.js";
// import Company from "../../DB/models/Company.Model.js";

// /**

//  * @returns  {Function} - Middleware function
//  * @description - Middleware function to check if the user role is allowed to access the route
// */
// export const ownerAuthorizationMiddleware = () => {
//   return async (req, res, next) => {
//     // Get the loggedIn user from the request authUser from auth middleware
//     const user = req.authUser;
//     const {_id} = req.params;
//     const company = await Company.findById(_id);
//     // Check if the allowed roles array includes the user role
//     if (!company.companyHR[0].equals(user._id) ) {
//       return next(
//         new ErrorClass(
//           "Authorization Error",
//           401,
//           "You are not allowed to edit"
//         )
//       );
//     }
//     next();
//   };
// };
