const app = require("./app");
const connectDB = require("./config/db");
require("dotenv").config();

connectDB();

app.listen(process.env.PORT || 3000, () => console.log("Server started"));
