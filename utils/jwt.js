const jwt = require("jsonwebtoken");
require("dotenv").config();

function generateAccessToken(userId, role) {
    const payload = {
        userId,
        role,
    };
    const secretKey = process.env.ACCESS_TOKEN_SECRET;
    const options = { expiresIn: "1h" };

    return jwt.sign(payload, secretKey, options);
}
function generateRefreshToken(userId) {
    const payload = {
        userId,
    };
    const secretKey = process.env.REFRESH_TOKEN_SECRET;
    const options = { expiresIn: "1y" };

    return jwt.sign(payload, secretKey, options);
}
function generateResetToken(userId) {
    const payload = {
        userId,
    };
    const secretKey = process.env.RESET_TOKEN_SECRET;
    const options = { expiresIn: "10m" };

    return jwt.sign(payload, secretKey, options);
}

module.exports = { generateAccessToken, generateRefreshToken, generateResetToken };
