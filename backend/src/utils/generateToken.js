const jwt = require("jsonwebtoken");

const accessToken = (payload) => {
    return jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {expiresIn:"15m"});
}

const refreshToken = (payload) => {
    return jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, {expiresIn:"7d"});
}

module.exports = {accessToken,refreshToken}