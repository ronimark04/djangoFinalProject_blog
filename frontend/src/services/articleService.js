import axios from "axios";

const BASE_BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://127.0.0.1:8000";
const api = `${BASE_BACKEND_URL}/api/articles/`;

export function getAllArticles(url = null) {
    return axios.get(url || api);
}

export function getArticleById(id) {
    return axios.get(`${api}${id}/`);
}

export function getComments(id) {
    return axios.get(`${api}${id}/comments/`);
}

export function getArticlesByTag(tag, url = null) {
    const searchUrl = url || `${api}?search=${tag}`;
    return axios.get(searchUrl);
}
