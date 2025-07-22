const mongoose = require("mongoose");

const connectDB = () => {
	mongoose
		.connect(
			"mongodb+srv://ntilab:EDIKIPZo4kWSTcYH@cluster0.gmczi2u.mongodb.net/mydb?retryWrites=true&w=majority&appName=Cluster0"
		)
		.then(() => console.log("MongoDB connected"))
		.catch((err) => console.log("DB connection error:", err));
};

module.exports = connectDB;
