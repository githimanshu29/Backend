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
};

export const generateRefreshToken = (userId) => {
  return jwt.sign({ userId:userId.toString() }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: "7d",
  });
};
