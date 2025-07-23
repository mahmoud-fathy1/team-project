const express = require("express");
const postRoutes = require("./routes/post.routes");
const userRoutes = require("./routes/user.routes.js");
const bcrypt = require("bcrypt");
const cookieParser = require("cookie-parser");
const { query, body, header, validationResult, matchedData } = require("express-validator");
const User = require("./models/user.model.js");
const helmet = require("helmet");
// const rateLimit = require("express-rate-limit");
const morgan = require("morgan");
const fs = require("fs");
const path = require("path");
const winston = require("winston");
const { createClient } = require("redis");
const { json } = require("stream/consumers");
const connectDB = require("./config/db.js");
require("dotenv").config();

connectDB();

// const redisClient = createClient();

// redisClient
//     .connect()
//     .then(() => {
//         console.log("Connected to Redis server");
//     })
//     .catch((err) => {
//         logger.error(err);
//     });

// redisClient.on("error", (err) => {
//     logger.error(err);
// });

const logger = winston.createLogger({
    level: "info",
    format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
    transports: [
        new winston.transports.Console({
            format: winston.format.combine(winston.format.colorize(), winston.format.simple()),
        }),
        new winston.transports.File({ filename: "logs/app.log" }),
    ],
});

// logger.info("info log");
// logger.warn("warn log");
// logger.error("error log");
// logger.silly("error log");
// logger.debug("error log");

const accessLogStream = fs.createWriteStream(path.join(__dirname, "logs", "access.log"), {
    flags: "a",
});

// const limiter = rateLimit({
//     windowMs: 15 * 60 * 1000,
//     max: 2,
// });

const app = express();
// app.use("/", limiter);
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded());
app.use(cookieParser());
app.use(
    morgan("combined", {
        stream: {
            write: function (log) {
                logger.info(log);
            },
        },
    })
);
// app.use(morgan("dev"));
app.use("/posts", postRoutes);
app.use("/users", userRoutes);

app.get("/", (req, res) => {
    res.send("Hello");
});


app.use((err, req, res, next) => {
    console.log(err);

    err.statusCode = err.statusCode || 500;
    err.status = err.status || "error";

    res.status(err.statusCode).json({
        success: "false",
        message: err.message,
    });
});

app.listen(process.env.PORT || 3000, () => console.log("Server started"));
