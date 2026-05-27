import axiosInstance from "./axiosInstance";

export const signup = async (userData) => {
    try {
        const response = await axiosInstance.post("/signup", userData);
        if (response?.success) {
            localStorage.setItem("hasSession", true);
        }
        return response;
    } catch (error) {
        throw error;
    }
};

export const signin = async (userData) => {
    try{
        const response = await axiosInstance.post("/signin", userData);
        if(response?.success){
            localStorage.setItem("hasSession", true);
        }
        return response;
    }catch(error){
        throw error
    }
};

export const logout = async () => {
    try{
        const response = await axiosInstance.post("/logout");
        if(response?.success){
            localStorage.removeItem("hasSession");
        }
        return response;
    }catch(error){
        throw error;
    }
};

export const check2FAStatus = async (tempToken) => {
    try {
        const response = await axiosInstance.post("/check-2fa-status", { tempToken });
        if (response?.success && response?.isVerified) {
            localStorage.setItem("hasSession", true);
        }
        return response;
    } catch (error) {
        throw error;
    }
};

export const authme = async() =>{
    try{
        const response = await axiosInstance.get("/authme");
        return response;
    }catch(error){
        throw error;
    }
};