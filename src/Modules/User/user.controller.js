// import { hashSync } from "bcrypt";
import { ErrorClass } from "../../Utils/index.js";
import { User, Address } from "../../../DB/Models/index.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { sendEmailService } from "../../services/send-email.service.js";
import { OAuth2Client } from "google-auth-library";
/**
 * @api (post) /users/register registration a new user
 */

export const registerUser = async (req, res, next) => {
  const {
    username,
    email,
    password,
    gender,
    age,
    phone,
    userType,
    country,
    city,
    postalCode,
    buildingNumber,
    floorNumber,
    flatNumber,
    addressLabel,
    isDefault,
  } = req.body;

  const isEmailExist = await User.findOne({ email });
  if (isEmailExist) {
    return next(new ErrorClass("email already exist", 400));
  }
  // const hashedPassword = hashSync(password, +process.env.SALT_ROUNDS);

  // send email to do

  const userInstance = new User({
    username,
    email,
    password,
    gender,
    age,
    phone,
    userType,
  });

  // create address instance
  const addressInsatnce = new Address({
    userId: userInstance._id,
    country,
    city,
    postalCode,
    buildingNumber,
    floorNumber,
    flatNumber,
    addressLabel,
    isDefault: true,
  });

  const token = jwt.sign(
    { _id: userInstance._id },
    process.env.CONFIRMATION_SECRET,
    {
      expiresIn: "1h",
    }
  );

  const confirmationLink = `${req.protocol}://${req.headers.host}/users/confirm-email/${token}`;

  const isEmailSent = await sendEmailService({
    to: email,
    subject: "Welcome to our app",
    textMessage: "Hello, welcome to our app",
    htmlMessage: `<a href="${confirmationLink}">Click here to confirm your email</a>`,
  });

  if (isEmailSent.rejected.length) {
    return res.status(400).json({ message: "Email not sent" });
  }
  //create user in db
  const newUser = await userInstance.save();
  const savedAddress = await addressInsatnce.save();
  //send the res
  res
    .status(201)
    .json({
      message: "rejistration successfully",
      data: newUser,
      savedAddress,
    });
};

export const updateAccount = async (req, res, next) => {
  const { id } = req.params;
  const { username, email, password, gender, age, phone, userType } = req.body;
  // const document = new User({_id: id});
  // const user = await document.updateOne({username, email, password, gender, age, phone, userType});

  const user = await User.findById(id);
  // // const user = await User.updateOne({_id:id},{$set:{username, email, password, gender, age, phone, userType}});
  if (!user) {
    return next(new ErrorClass("User not found", 404));
  }
  // if (password) {
  //   const hashedPassword = hashSync(password, +process.env.SALT_ROUNDS);
  // }
  const userObject = {
    username,
    email,
    password,
    gender,
    age,
    phone,
    userType,
  };
  const updatedUser = await User.findOneAndUpdate({ _id: id }, userObject, {
    new: true,
  });
  res.status(200).json({ message: "account updated", data: user });
};
export const confirmEmail = async (req, res) => {
  const { token } = req.params;
  const { _id } = jwt.verify(token, process.env.CONFIRMATION_SECRET);

  const user = await User.findOneAndUpdate(
    { _id, isConfirmed: false },
    { isConfirmed: true },
    { new: true }
  );

  if (!user) {
    return res.status(400).json({ message: "User not found" });
  }
  res.send("<center><h2>Email is Confirmed</h2></center>");
};

export const login = async (req, res, next) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    return next(
      new ErrorClass("Invalid credentials", 400, "Invalid credentials")
    );
  }

  const isMatch = bcrypt.compareSync(password.toString(), user.password);
  if (!isMatch) {
    return next(
      new ErrorClass("Invalid credentials2", 400, "Invalid credentials")
    );
  }

  await User.findByIdAndUpdate(user._id, {
    status: "online",
  });

  const token = jwt.sign({ userId: user._id }, process.env.LOGIN_SECRET);
  res.status(200).json({ message: "Login success", token });
};

export const loginWIthGmail = async (req, res, next) => {
  const { idToken } = req.body;

  const client = new OAuth2Client();
  async function verify() {
    const ticket = await client.verifyIdToken({
      idToken: idToken,
      audience: process.env.CLIENT_ID, // Specify the CLIENT_ID of the app that accesses the backend
      // Or, if multiple clients access the backend:
      //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
    });
    const payload = ticket.getPayload();
    // const userid = payload['sub'];
    // If the request specified a Google Workspace domain:
    // const domain = payload['hd'];
    return payload;
  }
  const result = await verify().catch(console.error);
  if (!result.email_verified)
    return next(
      new ErrorClass("Email not verified", 400, "Email not verified")
    );

  const user = await User.findOne({ email: result.email, provider: "GOOGLE" });

  if (!user) {
    return next(new ErrorClass("User not found", 400, "User not found"));
  }

  const token = jwt.sign(
    { userId: user._id, email: result.email },
    process.env.LOGIN_SECRET
  );
  user.isLoggedIn = true;
  await user.save();

  res.status(200).json({ message: "Login success", result , token});
};


export const signUpWIthGmail = async (req, res, next) => {
  const { idToken } = req.body;

  const client = new OAuth2Client();
  async function verify() {
    const ticket = await client.verifyIdToken({
      idToken: idToken,
      audience: process.env.CLIENT_ID, // Specify the CLIENT_ID of the app that 
    });
    const payload = ticket.getPayload();
    return payload;
  }
  const result = await verify().catch(console.error);
  // if(!result.email_verified){
  //   return next(new ErrorClass("Email not verified", 400, "Email not verified"));
  // }
  
  const isEmailExist = await User.findOne({ email: result.email });
  if (isEmailExist) {
    return next(new ErrorClass("email already exist", 400));
  }

  // send email to do
  const randomPassword = Math.random().toString(36).slice(-8);

  const userInstance = new User({
    username : result.name,
    email: result.email,
    password: randomPassword,
    gender: result.gender,
    phone:"09211111111",
    provider: "GOOGLE",
  });

  // const token = jwt.sign(
  //   { _id: userInstance._id },
  //   process.env.CONFIRMATION_SECRET,
  //   {
  //     expiresIn: "1h",
  //   }
  // );


  //create user in db
  const newUser = await userInstance.save();
  // const savedAddress = await addressInsatnce.save();
  //send the res
  res
    .status(201)
    .json({
      message: "rejistration successfully",
      data: newUser
    });
  
};
