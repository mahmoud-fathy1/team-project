const jwt = require("jsonwebtoken");
require("dotenv").config();

function generateAccessToken(userId, role) {
	const payload = {
		userId,
		role,
	};
	const secretKey = process.env.JWT_SECRET;
	const options = { expiresIn: "1h" };

	return jwt.sign(payload, secretKey, options);
}
function generateRefreshToken(userId) {
	const payload = {
		userId,
	};
	const secretKey = process.env.JWT_SECRET;
	const options = { expiresIn: "1h" };

	return jwt.sign(payload, secretKey, options);
}

function generateResetToken(userId) {
	return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "10m" }); // valid for 10 minutes
}

module.exports = { generateAccessToken, generateRefreshToken, generateResetToken };
