const mongoose = require("mongoose");
require("dotenv").config();

const connectDB = () => {
    mongoose.connect(process.env.MONGO_URI).then(() => console.log("MongoDB connected"));
};

module.exports = connectDB;
