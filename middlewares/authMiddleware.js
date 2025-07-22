const jwt = require("jsonwebtoken");

function authenticate(req, res, next) {
	const authHeader = req.headers.authorization;
	const token = authHeader?.split(" ")[1];

	if (!token) return res.status(401).json({ message: "Token missing" });

	jwt.verify(token, process.env.JWT_SECRET, (err, payload) => {
		if (err) return res.status(403).json({ message: "Invalid or expired token" });

		req.user = payload;
		next();
	});
}

module.exports = { authenticate };
