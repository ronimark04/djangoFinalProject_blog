import axios from "axios";

const api = `http://127.0.0.1:8000/api/articles/${id}/comments`;

export function getComments() {
    return axios.get(api);
};