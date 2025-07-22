const express = require("express");
const Post = require("../models/post.model");
const { signup, getProfile, forgotPassword, resetPassword, getUser } = require("../controllers/user.controller");
const { authenticate } = require("../middlewares/authMiddleware");

const router = express.Router();

function authorizeRole(role) {
	return function (req, res, next) {
		if (req.user.role !== role) {
			return res.status(403).json({ message: "Access denied" });
		}
		next();
	};
}

// function isAdmin(req, res, next) {
// 	if (req.user.role !== "admin") {
// 		return res.status(403).json({ message: "Access denied" });
// 	}
// 	next();
// }

router.post("/signup", signup);
router.get("/profile", authenticate, getProfile);
router.get("/user/:id", getUser);
router.get("/admin", authenticate, authorizeRole("admin"), getProfile);
router.post("/forgot-password", forgotPassword);
router.get("/reset-password/:token", resetPassword);

module.exports = router;
