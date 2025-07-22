const winston = require("winston");

const logger = winston.createLogger({
	transports: [
		new winston.transports.Console({
			level: "info",
			format: winston.format.combine(winston.format.colorize(), winston.format.simple()),
		}),
		new winston.transports.File({
			filename: "logs/app.log",
			format: winston.format.json(),
		}),
	],
	exceptionHandlers: [new winston.transports.File({ filename: "logs/exceptions.log" })],
	rejectionHandlers: [new winston.transports.File({ filename: "logs/rejections.log" })],
});

// console.log(logger);

module.exports = logger;
