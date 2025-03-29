import api from "./api";

export function getComments(articleId) {
    return api.get(`/api/articles/${articleId}/comments/`);
}

export function createComment(articleId, content, replyTo = null) {
    const token = localStorage.getItem("access_token");
    const body = {
        content,
        article: articleId
    };
    if (replyTo) {
        body.reply_to = replyTo;
    }

    return api.post(`/api/comments/`, body, {
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
        },
    });
}

export function editComment(commentId, updatedContent) {
    const token = localStorage.getItem("access_token");

    return api.patch(`/api/comments/${commentId}/`,
        { content: updatedContent },
        {
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
        }
    );
}

export function deleteComment(commentId) {
    const token = localStorage.getItem("access_token");

    return api.delete(`/api/comments/${commentId}/`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
}
