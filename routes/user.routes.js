const express = require("express");
const Post = require("../models/post.model");
const {
    signUp,
    logIn,
    getProfile,
    getAccessToken,
    forgetPassword,
    resetPassword,
} = require("../controllers/user.controller");
const { authenticate, authorize } = require("../middlewares/authMiddleware");

const router = express.Router();

router.post("/signup", signUp);
router.post("/login", logIn);
router.get("/profile", getProfile);
router.post("/refresh-token", getAccessToken);
router.post("/forget-password", forgetPassword);
router.post("/reset-password/:token", resetPassword);
router.get("/admin", authenticate, authorize("admin"), (req, res) => {
    res.send("Admin Dashboard");
});

console.log("hello");

module.exports = router;
