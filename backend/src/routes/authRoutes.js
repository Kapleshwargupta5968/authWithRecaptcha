const express = require("express");
const { signUp, signIn, logOut, authMe, refreshToken, verify2FAEmailClick, poll2FAStatus } = require("../controllers/authController");
const authMiddleware = require("../middlewares/authMiddleware");

const router = express.Router();

// Public routes
router.post("/signup", signUp);
router.post("/signin", signIn);
router.post("/refresh-token", refreshToken);
router.get("/verify-2fa", verify2FAEmailClick);
router.post("/check-2fa-status", poll2FAStatus);

// Protected routes (require valid access token)
router.post("/logout", authMiddleware, logOut);
router.get("/authme", authMiddleware, authMe);

module.exports = router;
