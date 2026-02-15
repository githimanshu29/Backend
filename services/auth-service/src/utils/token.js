import jwt from "jsonwebtoken";

/*
  Token Strategy (Swiggy Style)

  Access Token  → Short life (15 min) used to Access protected APIs sent every request,if stolen Limited damage

  Refresh Token → Long life (7 days) used to generate new access token and they dont often sent to server, if stolen Dangerous
  

*/

export const generateAccessToken = (userId) => {
  return jwt.sign({ userId:userId.toString() }, process.env.JWT_ACCESS_SECRET, {
    expiresIn: "15m",
  });
};// The Access Token: A string sent to the client so the frontend can prove to the server who the user is for the next 15 minutes.

export const generateRefreshToken = (userId) => {
  return jwt.sign({ userId:userId.toString() }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: "7d",
  });
};//The Refresh Token: A string stored in a cookie to get a new Access Token later.


// 🔥🔥🔥🔥JWTs are sent with every single HTTP request. Keeping them small (just an ID) saves bandwidth.