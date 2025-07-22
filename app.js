const express = require("express");
const postRoutes = require("./routes/post.routes");
const userRoutes = require("./routes/user.routes.js");
const bcrypt = require("bcrypt");
const cookieParser = require("cookie-parser");
const { query, validationResult, matchedData } = require("express-validator");
const User = require("./models/user.model.js");
const morgan = require("morgan");
const winston = require("winston");
const fs = require("fs");
const path = require("path");
const logger = require("./utils/logger.js");
const { createClient } = require("redis");

const client = createClient();
client
	.connect()
	.then(() => {
		console.log("Connected to redis server");
	})
	.catch((err) => {
		logger.error(err);
	});

const accessLogStream = fs.createWriteStream(
	path.join(__dirname, "logs", "access.log"),
	{ flags: "a" } // append mode
);

accessLogStream.write("hello");

const customStream = {
	write: function (message) {
		logger.info(message);
	},
};

// customStream.write();

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(morgan("combined", { stream: customStream }));
// app.use(morgan("dev"));

// // 2. Setup Morgan and send logs to Winston
// app.use(
// 	morgan("combined", {
// 		stream: {
// 			write: (message) => logger.info(message.trim()), // trim to remove newline
// 		},
// 	})
// );
app.use("/posts", postRoutes);
app.use("/users", userRoutes);

app.get("/user/:id", async (req, res, next) => {
	try {
		const userId = req.params.id;

		// 🔄 This is an actual async operation
		const user = await User.findById("userId");

		if (!user) {
			const error = new Error("User not found");
			error.statusCode = 404;
			throw error;
		}

		res.json(user);
	} catch (err) {
		next(err); // 🔁 Send the error to the global error handler
	}
});

// // ✅ Global error handler (must be last)
// function errorHandler(err, req, res, next) {
// 	console.log("Error message:", err.message);

// 	res.status(err.statusCode || 500).json({
// 		success: false,
// 		message: err.message || "Server Error",
// 	});
// }

// app.use(errorHandler);

app.get("/data", async (req, res) => {
	const cacheKey = "bigjson";

	try {
		// Check cache
		const cachedData = await client.get(cacheKey);

		if (cachedData) {
			// Send cached data
			return res.json(JSON.parse(cachedData));
		}

		// If no cache, fetch from API
		const response = await fetch("https://microsoftedge.github.io/Demos/json-dummy-data/5MB.json");
		const data = await response.json();

		// Save data to Redis (expires in 60 seconds)
		await client.set(cacheKey, JSON.stringify(data), { EX: 60 });

		res.json(data);
	} catch (error) {
		res.status(500).json({ error: "Failed to fetch data" });
	}
});

module.exports = { app };
