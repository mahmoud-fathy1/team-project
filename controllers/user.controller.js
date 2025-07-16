const User = require("../models/user.model");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { generateRefreshToken, generateAccessToken, generateResetToken } = require("../utils/jwt");
const { sendEmail } = require("../utils/sendEmail");

async function signUp(req, res) {
    const { name, email, password, role } = req.body;

    // 🔍 Step 1: Check if email or password is missing
    if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required." });
    }

    // 🔍 Step 2: Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
        return res.status(409).json({ message: "Email already in use." });
    }

    const hashedPass = await bcrypt.hash(password, 12);

    const user = await User.create({
        name,
        email,
        password: hashedPass,
        role,
    });

    const accessToken = generateAccessToken(user._id, user.role);
    const refreshToken = generateRefreshToken(user._id);

    res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        // secure: true,
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 Days
    });

    // console.log(accessToken);
    // console.log(refreshToken);

    res.status(201).json({
        message: "User Created Successfully",
        accessToken,
    });
}

async function logIn(req, res) {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        const accessToken = generateAccessToken(user._id, user.role);
        const refreshToken = generateRefreshToken(user._id);

        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            // secure: true,
            sameSite: "none",
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 Days
        });

        res.status(201).json({
            message: "Login Successfull",
            accessToken,
        });
    } catch (error) {
        console.log(error);
    }
}

async function getProfile(req, res, next) {
    try {
        throw new Error("User not found");

        res.json({ message: "Your profile info:", user });
    } catch (err) {
        next(err);
    }
}

function getAccessToken(req, res) {
    try {
        const refreshToken = req.cookies.refreshToken;

        // If no refresh token found
        if (!refreshToken) {
            return res.status(401).json({ message: "No refresh token" });
        }

        let userId = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);

        const accessToken = generateAccessToken(userId);

        res.json({ accessToken });
    } catch (error) {
        console.log(error);
    }
}

async function forgetPassword(req, res) {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });

    const user = await User.findOne({ email });
    if (!user) {
        // Do NOT reveal that email doesn’t exist
        return res.status(200).json({ message: "Reset link sent (if email exists)" });
    }

    const resetToken = generateResetToken(user._id);

    const subject = "Reset your Password";
    const html = `
    <p>Hello,</p>
    <p>Enter your new password then Click the link below to reset your password:</p>
            <h1>Reset Password</h1>
        <form action="http://localhost:3000/users/reset-password/${resetToken}" method="post">
            <input type="password" name="newPassword" id="" />
            <button type="submit">Reset Password</button>
        </form>
    <p>This link will expire in 10 minutes.</p>
  `;

    await sendEmail(user.email, subject, html);

    res.status(200).json({ message: "Reset link sent (if email exists)" });
}

async function resetPassword(req, res) {
    console.log("reset Password");

    const { newPassword } = req.body;
    const token = req.params.token;

    const payload = jwt.verify(token, process.env.RESET_TOKEN_SECRET);

    const user = await User.findById(payload.userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const hashdedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashdedPassword;
    await user.save();
    res.status(200).json({ message: "Password has been updated successfully" });
}

module.exports = { signUp, logIn, getProfile, getAccessToken, forgetPassword, resetPassword };
