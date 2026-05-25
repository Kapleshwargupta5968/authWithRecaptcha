const jwt = require("jsonwebtoken");
const User = require("../models/user");

const authMiddleware = async (req, res, next) => {
    try {
        const token = req.cookies.accessToken || (req.headers.authorization && req.headers.authorization?.split(" ")[1]);
        if(!token){
            return res.status(401).json({
                success: false,
                message: "Unauthorized: No token provided"
            });
        }
        try{
            const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
            const user = await User.findById(decoded.id).select("-password");
            if (!user){
                return res.status(401).json({
                    success:false,
                    message:"Unauthorized: Invalid token"
                });
            }
            req.user = user;
            next();
        }catch(error){
            return res.status(401).json({
                success:false,
                message:"Invalid token"
            })
        }
    } catch (error) {
        return res.status(500).json({ 
            success:false,
            message: error.message 
        });
    }
};

module.exports = authMiddleware;