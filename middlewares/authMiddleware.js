const jwt = require("jsonwebtoken");


function authenticate(req, res, next) {
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader?.split(" ")[1];

        if (!token) return res.status(401).json({ message: "Token missing" });

        jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, payload) => {
            if (err) return res.status(403).json({ message: "Invalid or expired token" });

            req.user = payload;
            next();
        });
    } catch (error) {
        console.log(error);
    }
}

function authorize(role) {
    function checkRole(req, res, next) {
        if (req.user.role !== role) {
            res.status(403).json({ message: "Access denied" });
            return;
        }
        next();
    }

    return checkRole;
}

module.exports = { authenticate, authorize };
