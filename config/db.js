const mongoose = require("mongoose");
require("dotenv").config();

const connectDB = () => {
    mongoose
        .connect(process.env.MONGO_URI)
        .then(() => console.log("MongoDB connected"))
        .catch((err) => console.log("DB connection error:", err));
};

module.exports = connectDB;
