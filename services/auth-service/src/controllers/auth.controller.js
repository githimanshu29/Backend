import User from "../models/User.js";
import { generateAccessToken, generateRefreshToken } from "../utils/token.js";
import jwt from "jsonwebtoken";

// 🧠🧠🧠 what are csrf risks

export const registerUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    console.log("REQ BODY:", req.body);

    // 1. Validate input
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // before register check if user already exixt

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "user already exist with this eamil",
      });
    }

    // if not exist simply save user to DB
    const user = await User.create({
      name,
      email,
      password,
      role,
    });

    console.log("User Created:", user);

    // 🚨 Safety check
    if (!user || !user._id) {
      return res.status(500).json({
        success: false,
        message: "User creation failed",
      });
    }

    const safeUser = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    };

    // generate tokens

    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    // store refresh token in secure cookie, only storing not sending  The refreshToken is handled automatically by the browser because you set it as a cookie. The frontend JavaScript can't even "see" it (due to httpOnly: true), which is great for security!
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: false, //true in production
      sameSite: "lax",
    });

    //send response-> only this response get send
    res.status(201).json({
      success: true,
      message: "User registered successfully",
      accessToken,
      user: safeUser,
    });

    // HTTP contains two things Headers and body
    //Headers stores cookie
    //body stores accesstoken and user body
    //🎯✔ Browser receives both cookie + JSON together
  } catch (error) {
    console.log("Full error:", error);
    console.log("🔥 ERROR MESSAGE:", error.message);
    res.status(500).json({
      success: false,
      message: "registration failed",
      error: error.message,
    });
  }
};

// ┌────────────────────────────┐
// │ HTTP RESPONSE              │
// │                            │
// │ Headers:                   │
// │   Set-Cookie: refreshToken│
// │                            │
// │ Body (JSON):               │
// │   accessToken              │
// │   user info                │
// └────────────────────────────┘

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log(req.body);

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Provide valide email and password",
      });
    }

    const user = await User.findOne({ email }).select("+password");//Search the users collection for a document where email equals this email. using select("+password") ensures that password will be return wihtout password may not be in user body

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Please enter valid email and password",
      });
    }

    // decrypt the password
    const decodedPassword = await user.comparePassword(password);

    if (!decodedPassword) {
      return res.status(500).json({
        success: false,
        message: "Entered password is wrong",
      });
    }

    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    //now save refresh token in db
    user.refreshToken = refreshToken;
    await user.save();

    //set refreshToken into cookie
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: false, //true in production
      sameSite: "lax",
    });

    const safeUser = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    };

    //send response-> only this response get send and access token sent in response body only once and recieved byy client and stores it as ✅✅localStorage.setItem("accessToken", token);  Server cannot push token into requests. Because HTTP is stateless.thats Why Server Doesn’t Send It Automatically? ✅✅✅✅✅ Browser can send cookie automatically time but not access token


   /*
     ✅ Then For EVERY Protected Request… 
    Client(frontend) must attach token .

    GET /api/auth/me
    Authorization: Bearer <token>

    GET /api/orders
Authorization: Bearer <token>


👉 Token is sent once per request, not once for all routes.

Because HTTP requests are independent.
   */




    res.status(201).json({
      success: true,
      message: "User login successfully",
      accessToken,
      user: safeUser,
    });
  } catch (error) {
    console.log(`Full login error is:${error}`);
    console.log(` error Message is:${error.message}`);

    return res.status(500).json({
      success: false,
      message: "Login Unsuccessfull",
    });
  }
};

export const refreshAccessToken = async (req, res) => {
  try {
    const tokenFromCookie = req.cookies.refreshToken;

    console.log("COOKIES:", req.cookies);

    if (!tokenFromCookie) {
      return res.status(401).json({
        success: false,
        message: "Refresh token missing",
      });
    }

    //verify refresh token means extract the token
    const decoded = jwt.verify(tokenFromCookie, process.env.JWT_REFRESH_SECRET);
    console.log(`tokenFromCookie: ${tokenFromCookie}`)
    console.log(`decoded :${decoded} and id:${decoded.userId}`)

    const user = await User.findById(decoded.userId);

    if (!user || user.refreshToken !== tokenFromCookie) {
      return res.status(403).json({
        success: false,
        message: "INvalid refresh token (token reuse detected)",
      });
    }

    const newAccessToken = generateAccessToken(user._id);// new accessToken generated
    const newRefreshToken = generateRefreshToken(user._id);

    user.refreshToken = newRefreshToken;
    await user.save();

    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
    });

    res.status(200).json({
      success: true,
      message: "Token refreshed successfully",
      accessToken: newAccessToken,
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      message: "Refresh token expired or invalid",
      error: error.message,
    });
  }
};

export const logoutUser = async (req, res) => {
  try {
    const tokenFromCookie = req.cookies.refreshToken;

    if (tokenFromCookie) {
      const user = await User.findOne({ refreshToken: tokenFromCookie });

      if (user) {
        user.refreshToken = null;//this makes user logout
        await user.save();
      }
    }

    //cookie clear karo

    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
    });

    res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Logout failed",
      error: error.message,
    });
  }
};

export const getMe = async(req,res)=>{
    res.status(200).json({
        success: true,
        message: "User profile fetched successfully",
        user: req.user, // comes from protect middleware
      });
}


/**  ✅ Scenario: Frontend Logs In Once
// ✅✅  auth.js
import axios from "axios";

export const loginUser = async () => {
  const res = await axios.post("http://localhost:5001/api/auth/login", {
    email: "himanshu@gmail.com",
    password: "1234567",
  });

  //  Extract token ONCE
  const token = res.data.accessToken;

  //  Store it
  localStorage.setItem("accessToken", token);

  console.log("Logged in, token stored!");
};

//✅✅So token is extracted only one time:


🔥🔥🔥🔥🔥Setup Axios to Attach Token Automatically to avoid manual work multiple times
✅✅✅ apiclient.js
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5001",
});

/*
  ✅ Axios Interceptor
  This runs before EVERY request
  Automatically attaches token

api.interceptors.request.use((config) => {
    const token = localStorage.getItem("accessToken");
  
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  
    return config;
  });
  
  export default api;

  Now 🔥🔥🔥 Get Profile Route /me
  Get Profile Route /me

  import api from "./apiClient";

export const getProfile = async () => {
  const res = await api.get("/api/auth/me");
  console.log(res.data);
};


*/