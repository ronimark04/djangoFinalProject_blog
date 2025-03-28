import api from "./api";

export function getAllArticles(url = null) {
    return api.get(url || "/api/articles/");
}

export function getArticleById(id) {
    return api.get(`/api/articles/${id}/`);
}

export function getComments(id) {
    return api.get(`/api/articles/${id}/comments/`);
}

export function getArticlesByTag(tag, url = null) {
    const searchUrl = url || `/api/articles/?search=${tag}`;
    return api.get(searchUrl);
}

export function getArticlesBySearch(query) {
    return api.get(`/api/articles/?search=${query}`);
}