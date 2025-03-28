import axios from "axios";
import { refreshToken, logoutUser } from "./userService";

const BASE_BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://127.0.0.1:8000";

const api = axios.create({
    baseURL: BASE_BACKEND_URL,
});

// Automatically refresh token on 401 errors
api.interceptors.response.use(
    response => response,
    async error => {
        const originalRequest = error.config;

        // If request failed due to expired access token (401)
        if (error.response && error.response.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            try {
                const newAccessToken = await refreshToken();
                originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;
                return api(originalRequest);
            } catch (refreshError) {
                logoutUser();
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export default api;
