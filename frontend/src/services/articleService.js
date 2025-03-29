import api from "./api";

export function getAllArticles(url = null) {
    return api.get(url || "/api/articles/");
}

export function getArticleById(id) {
    return api.get(`/api/articles/${id}/`);
}

export function getArticlesByTag(tag, url = null) {
    const searchUrl = url || `/api/articles/?search=${tag}`;
    return api.get(searchUrl);
}

export function getArticlesBySearch(query) {
    return api.get(`/api/articles/?search=${query}`);
}

export function createArticle(articleData) {
    return api.post(`/api/articles/`, articleData);
}

export function editArticle(id, updatedData) {
    const token = localStorage.getItem("access_token");

    return api.put(`/api/articles/${id}/`, updatedData, {
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
        },
    });
}

export function deleteArticle(id) {
    const token = localStorage.getItem("access_token");

    return api.delete(`/api/articles/${id}/`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
}
