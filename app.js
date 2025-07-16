const express = require("express");
const postRoutes = require("./routes/post.routes");
const userRoutes = require("./routes/user.routes.js");
const bcrypt = require("bcrypt");
const cookieParser = require("cookie-parser");
const { query, body, header, validationResult, matchedData } = require("express-validator");
const User = require("./models/user.model.js");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 2,
});

const app = express();
app.use("/", limiter);
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded());
app.use(cookieParser());
app.use("/posts", postRoutes);
app.use("/users", userRoutes);
app.use("/posts", postRoutes);
app.use("/users", userRoutes);

// let emailValidation = function () {
//     return query("email").notEmpty().isEmail().optional({ checkFalsy: true });
// };

// app.post("/login", emailValidation(), loginHandler);
// app.post("/signup", emailValidation().custom(checkEmailNotUsed), signupHandler);

app.post(
    "/hello",
    body("email").custom(async (email, { req }) => {
        const newEmail = email.toLowerCase();

        return newEmail;
    }),
    (req, res) => {
        const result = validationResult(req);
        const data = matchedData(req);
        console.log(data);

        if (result.isEmpty()) {
            res.send(data);
            return;
        }

        res.status(400).json({ errors: result.array() });
    }
);

app.use((err, req, res, next) => {
    console.log(err);

    err.statusCode = err.statusCode || 500;
    err.status = err.status || "error";

    res.status(err.statusCode).json({
        success: "false",
        message: err.message,
    });
});
module.exports = app;
