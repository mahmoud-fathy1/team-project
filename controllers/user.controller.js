const User = require("../models/user.model");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { generateAccessToken, generateRefreshToken, generateResetToken } = require("../utils/jwt");
const sendEmail = require("../utils/sendMail");
const logger = require("../utils/logger");

// console.log(logger);

const signup = async (req, res) => {
	try {
		const { name, email, password, role } = req.body;

		// Step 1: Check if email or password is missing
		if (!email || !password) {
			return res.status(400).json({ message: "Email and password are required." });
		}

		// Step 2: Check if user already exists
		const existingUser = await User.findOne({ email });
		if (existingUser) {
			return res.status(409).json({ message: "Email already in use." });
		}

		// Step 3: Hash the password
		const saltRounds = 10;
		const hashedPassword = await bcrypt.hash(password, saltRounds);

		// Step 4: Create and save the user
		const newUser = new User({ name, email, password: hashedPassword, role });
		await newUser.save();

		// Step 5: Generate tokens
		const accessToken = generateAccessToken(newUser._id, newUser.role);
		const refreshToken = generateRefreshToken(newUser._id);

		// Step 6: Save refresh token in database (for logout and revocation)
		newUser.refreshToken = refreshToken;
		await newUser.save();

		// Step 7: Set refresh token in HTTP-only cookie
		res.cookie("refreshToken", refreshToken, {
			httpOnly: true, // cannot be accessed from JavaScript
			secure: true, // cookie only sent over HTTPS
			sameSite: "Strict", // prevent CSRF attacks
			maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
		});

		// Step 8: Return success with access token and user info
		const { password: _, refreshToken: __, ...userData } = newUser.toObject();

		res.status(201).json({
			message: "Signup successful",
			accessToken,
			user: userData,
		});
	} catch (error) {
		console.error("Signup error:", error);
		res.status(500).json({ message: "Server error. Please try again later." });
	}
};

async function getProfile(req, res) {
	console.log(req.cookies.refreshToken);
	try {
		const user = await User.findById(req.user.userId).select("-password");
		if (!user) return res.status(404).json({ message: "User not found" });

		res.json({ message: "Your profile info:", user });
	} catch (err) {
		res.status(500).json({ message: "Error fetching profile" });
	}
}
function getUser(req, res) {
	const user = User.findById(req.params.id).select("-password");
	logger.info(user);
	throw new Error("user not found");
	console.log("hello");

	res.json({ message: "Your profile info:", user });
}

const forgotPassword = async (req, res) => {
	const { email } = req.body;

	if (!email) return res.status(400).json({ message: "Email is required" });

	const user = await User.findOne({ email });
	if (!user) {
		// Do NOT reveal that email doesn’t exist
		return res.status(200).json({ message: "Reset link sent (if email exists)" });
	}

	const resetToken = generateResetToken(user._id);
	const resetLink = `http://localhost:3000/reset-password/${resetToken}`;

	const subject = "Reset your password";
	const html = `
	  <p>Hello,</p>
	  <p>Click the link below to reset your password:</p>
	  <a href="${resetLink}">${resetLink}</a>
	  <p>This link will expire in 10 minutes.</p>
	`;

	await sendEmail(user.email, subject, html);

	res.status(200).json({ message: "Reset link sent (if email exists)" });
};

const resetPassword = async (req, res) => {
	const token = req.params.token;
	const { newPassword } = req.body;

	if (!token) return res.status(400).json({ message: "Token is missing" });
	if (!newPassword) return res.status(400).json({ message: "New password is required" });

	try {
		const decoded = jwt.verify(token, process.env.JWT_SECRET);
		const user = await User.findById(decoded.userId);

		if (!user) return res.status(404).json({ message: "User not found" });

		const hashedPassword = await bcrypt.hash(newPassword, 10);
		user.password = hashedPassword;

		await user.save();

		res.status(200).json({ message: "Password has been updated successfully" });
	} catch (error) {
		console.error("Reset password error:", error);
		res.status(403).json({ message: "Invalid or expired token" });
	}
};

module.exports = { signup, getProfile, forgotPassword, resetPassword, getUser };
