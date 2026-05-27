const dotEnv = require("dotenv");
dotEnv.config();

const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const connectDB = require("./src/config/db");
const authRoutes = require("./src/routes/authRoutes");

const app = express();

// database connection 
connectDB();

// middleware
app.use(cors({
    origin: "http://localhost:5173", // Adjust if your frontend runs on a different port
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(cookieParser());

// routes
app.use("/auth/api", authRoutes);

// server 
app.listen(process.env.PORT || 5000,()=>{
    console.log(`Server is running on port ${process.env.PORT || 5000}`);
});
