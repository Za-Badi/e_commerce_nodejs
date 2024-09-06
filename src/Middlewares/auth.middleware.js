import jwt, { decode } from "jsonwebtoken";

async function verifyToken(req, res, next) {
  const token = req.header("Authorization");

  if (!token) return res.status(401).json({ error: "Access denied" });
  try {
    const decoded = jwt.verify(token, process.env.LOGIN_SECRET);
    decoded._id;
    next();
  } catch (error) {
    res.status(401).json({ error: "Invalid token" });
  }
}

// export const auth = async () => {
//   return async (req, res, next) => {
//     const token = req.header("Authorization");
//     if (!token)
//       return res.status(401).json({ error: "Access denied, signIn first" });

//     try {
//       const decoded = jwt.verify(token, "zaha-secret-key");
//       if (!decoded?._id) {
//         return res.status(400).json({ msessage: "invalid token payload" });
//       }

//       // find user
//       const user = await User.findbyId(decoded._id);
//       if (!user) {
//         return res.status(404).json({ msessage: "Please Signup" });
//       }
//       req.authUser = user;

//       next();

//     } catch (error) {}
//   };
// };
export default verifyToken;
