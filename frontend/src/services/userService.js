import axios from "axios";
import api from "./api";
import { jwtDecode } from "jwt-decode";

const BASE_BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://127.0.0.1:8000";

export function loginUser(username, password) {
    return axios.post(`${BASE_BACKEND_URL}/api/token/`, {
        username,
        password
    })
        .then(response => {
            const { access, refresh } = response.data;
            localStorage.setItem("access_token", access);
            localStorage.setItem("refresh_token", refresh);
            return { access, refresh };
        })
        .catch(error => {
            console.error("Login failed:", error);
            throw error;
        });
}

export function refreshToken() {
    const refresh = localStorage.getItem("refresh_token");
    if (!refresh) return Promise.reject("No refresh token available");

    return axios.post(`${BASE_BACKEND_URL}/api/token/refresh/`, { refresh })
        .then(response => {
            localStorage.setItem("access_token", response.data.access);
            return response.data.access;
        })
        .catch(error => {
            console.error("Token refresh failed:", error);
            logoutUser();
            throw error;
        });
}

export function logoutUser() {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
}

export function getAuthHeaders() {
    const token = localStorage.getItem("access_token");
    return token ? { Authorization: `Bearer ${token}` } : {};
}

export function registerUser(values) {
    const data = new FormData();
    Object.keys(values).forEach(key => {
        if (values[key]) {
            data.append(key, values[key]);
        }
    });

    return axios.post(`${BASE_BACKEND_URL}/api/register/`, data, {
        headers: { "Content-Type": "multipart/form-data" }
    })
        .then(response => loginUser(values.username, values.password)) // Auto login after registration
        .catch(error => {
            console.error("Registration failed:", error);
            throw error;
        });
}


export function getUserProfile(userId) {
    const token = localStorage.getItem("access_token");

    if (!token) {
        return Promise.reject("No access token found.");
    }

    try {
        return api.get(`${BASE_BACKEND_URL}/api/users/${userId}/`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
    } catch (error) {
        return Promise.reject("Invalid access token.");
    }
}
