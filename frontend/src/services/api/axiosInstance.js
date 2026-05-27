import axios from "axios";

const axiosInstance = axios.create({
    baseURL: "http://localhost:5000/auth/api",
    headers: {
        "Content-Type": "application/json",
    },
    withCredentials: true,
});

// Variables to handle concurrent requests during token refresh
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    
    failedQueue = [];
};

axiosInstance.interceptors.request.use((config)=>{
    return config;
}, (error) => {
    return Promise.reject(error);
})

axiosInstance.interceptors.response.use((response) => {
    return response?.data;
}, async (error)=>{
    const originalRequest = error.config;
    const isAuthRoute = originalRequest.url.includes('/signin') || originalRequest.url.includes('/signup');
    
    // Check if the error is 401, not an auth route, and we haven't already retried this specific request
    if (error?.response?.status === 401 && !originalRequest._retry && !isAuthRoute) {
        
        // If another request is already refreshing the token, add this request to the queue
        if (isRefreshing) {
            return new Promise(function(resolve, reject) {
                failedQueue.push({resolve, reject});
            }).then(() => {
                return axiosInstance(originalRequest);
            }).catch(err => {
                return Promise.reject(err);
            });
        }
        
        // Lock the refresh process and mark this request as retried
        originalRequest._retry = true;
        isRefreshing = true;
        
        try {
            // NOTE: Change "/refresh-token" to match your actual backend endpoint!
            // We use plain `axios` here instead of `axiosInstance` to prevent infinite interceptor loops if the refresh itself fails with 401.
            await axios.post("http://localhost:5000/auth/api/refresh-token", {}, {
                withCredentials: true
            });
            
            processQueue(null);
            
            // Re-attempt the original request that failed
            return axiosInstance(originalRequest);
        } catch (refreshError) {
            // If the refresh token also failed (e.g. it expired too), clear the session and force sign-in
            processQueue(refreshError, null);
            localStorage.removeItem("hasSession");
            localStorage.removeItem("user");
            window.location.replace("/signin");
            return Promise.reject(refreshError?.response?.data || refreshError);
        } finally {
            isRefreshing = false;
        }
    }
    
    // If the error was 401 (not on an auth route) but it was already retried or fell through
    if (error?.response?.status === 401 && !isAuthRoute) {
        localStorage.removeItem("hasSession");
        localStorage.removeItem("user");
        window.location.replace("/signin");
    }
    
    return Promise.reject(error?.response?.data || error);
});

export default axiosInstance;