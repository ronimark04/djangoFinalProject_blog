import axios from "axios";

const api = 'http://127.0.0.1:8000/api/articles/';

export function getAllArticles() {
    return axios.get(api);
};

export function getArticleById(id) {
    return axios.get(`${api}/${id}`);
};