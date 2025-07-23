const connectDB = require("./config/db");
const express = require("express");
// const postRoutes = require("./routes/post.routes");
const userRoutes = require("./routes/user.routes.js");
const cookieParser = require("cookie-parser");

const app = express();
app.use(express.json());
app.use(cookieParser());

// app.use("/posts", postRoutes);
app.use("/users", userRoutes);

app.get("/", (req, res) => {
    res.send("Welcome to the API");
});

connectDB();

app.listen(process.env.PORT || 3000, () => {
    console.log(`Server is running on port ${process.env.PORT || 3000}`);
});
