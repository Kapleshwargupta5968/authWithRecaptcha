const jwt = require("jsonwebtoken");
const User = require("../models/user");
const generateToken = require("../utils/generateToken");
const bcrypt = require("bcrypt");
const axios = require("axios");

const signUp = async (req, res) => {
    try {
        const { name, email, password, role, gRecaptchaToken } = req.body;
        if (!name || !email || !password || !gRecaptchaToken) {
            return res.status(401).json({
                success: false,
                message: "All fields, including CAPTCHA, are required"
            });
        }

        const googleVerifyUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.SECRET_KEY}&response=${gRecaptchaToken}`;
        const response = await axios.post(googleVerifyUrl, {}, {
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            }
        });
        const data = response?.data;
        if (!data?.success) {
            return res.status(401).json({
                success: false,
                message: "Invalid reCAPTCHA"
            });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(401).json({
                success: false,
                message: "User already exists"
            });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            role
        });

        const payload = {
            id: user._id,
            email: user.email,
            role: user.role
        }
        const accessToken = generateToken.accessToken(payload);
        const refreshToken = generateToken.refreshToken(payload);

        user.refreshToken = refreshToken;
        await user.save();

        res.cookie("accessToken", accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "development" ? false : true,
            sameSite: process.env.NODE_ENV === "development" ? "lax" : "strict",
            maxAge: 24 * 60 * 60 * 1000
        });
        return res.status(201).json({
            success: true,
            message: "User created successfully",
            user
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
};

const signIn = async (req, res) => {
    try {
        const { email, password, gRecaptchaToken } = req.body;
        if (!email || !password || !gRecaptchaToken) {
            return res.status(401).json({
                success: false,
                message: "All fields, including CAPTCHA, are required"
            });
        }

        const googleVerifyUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.SECRET_KEY}&response=${gRecaptchaToken}`;
        const response = await axios.post(googleVerifyUrl, {}, {
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            }
        });
        const data = response?.data;
        if (!data?.success) {
            return res.status(401).json({
                success: false,
                message: "Invalid reCAPTCHA"
            });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({
                success: false,
                message: "User not found"
            });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: "Invalid credentials"
            });
        }
        const payload = {
            id: user._id,
            email: user.email,
            role: user.role
        }
        const accessToken = generateToken.accessToken(payload);
        const refreshToken = generateToken.refreshToken(payload);

        user.refreshToken = refreshToken;
        await user.save();

        res.cookie("accessToken", accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "development" ? false : true,
            sameSite: process.env.NODE_ENV === "development" ? "lax" : "strict",
            maxAge: 24 * 60 * 60 * 1000
        });
        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "development" ? false : true,
            sameSite: process.env.NODE_ENV === "development" ? "lax" : "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000
        });
        return res.status(200).json({
            success: true,
            message: "User logged in successfully",
            user
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
};

const logOut = async (req, res) => {
    try {
        const user = req.user;
        user.refreshToken = null;
        await user.save();
        res.clearCookie("accessToken");
        res.clearCookie("refreshToken");
        return res.status(200).json({
            success: true,
            message: "User logged out successfully"
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
};

const authMe = async (req, res) => {
    try {
        const userId = req.user._id;
        const user = await User.findById(userId).select("-password");
        return res.status(200).json({
            success: true,
            message: "User profile fetched successfully",
            user
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
};

const refreshToken = async (req, res) => {
    try {
        const incomingRefreshToken = req.cookies.refreshToken;
        if (!incomingRefreshToken) {
            return res.status(401).json({
                success: false,
                message: "Refresh token not found"
            });
        }
        try {
            const decoded = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);

            const user = await User.findOne({ _id: decoded.id });
            if (!user) {
                return res.status(401).json({
                    success: false,
                    message: "Invalid refresh token"
                });
            }
            if (user.refreshToken !== incomingRefreshToken) {
                return res.status(401).json({
                    success: false,
                    message: "Invalid refresh token"
                });
            }
            const payload = {
                id: user._id,
                email: user.email,
                role: user.role
            }
            const accessToken = generateToken.accessToken(payload);
            const refreshToken = generateToken.refreshToken(payload);

            user.refreshToken = refreshToken;
            await user.save();

            res.cookie("accessToken", accessToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "development" ? false : true,
                sameSite: process.env.NODE_ENV === "development" ? "lax" : "strict",
                maxAge: 24 * 60 * 60 * 1000
            });
            res.cookie("refreshToken", refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "development" ? false : true,
                sameSite: process.env.NODE_ENV === "development" ? "lax" : "strict",
                maxAge: 7 * 24 * 60 * 60 * 1000
            });
            return res.status(200).json({
                success: true,
                message: "Refresh token generated successfully",
                user
            });
        } catch (error) {
            return res.status(401).json({
                success: false,
                message: "Invalid refresh token"
            });
        }
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}
module.exports = {
    signUp,
    signIn,
    logOut,
    authMe,
    refreshToken
};