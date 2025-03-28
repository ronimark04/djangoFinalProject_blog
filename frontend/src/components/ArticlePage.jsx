import { useEffect, useState } from "react";
import { getArticleById, getComments } from "../services/articleService";
import { useParams } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "./style/ArticlePage.css";

// Use import.meta.env for Vite-based projects
const BASE_BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://127.0.0.1:8000";

function ArticlePage() {
    const { id } = useParams();
    const [article, setArticle] = useState(null);
    const [comments, setComments] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        setIsLoading(true);
        getArticleById(id)
            .then((res) => setArticle(res.data))
            .catch((err) => console.error("Error fetching article:", err));

        getComments(id)
            .then((res) => {
                const updatedComments = res.data.map(comment => ({
                    ...comment,
                    author_profile_pic: comment.author_profile_pic
                        ? `${BASE_BACKEND_URL}${comment.author_profile_pic}`
                        : "/default_profile.png"
                }));
                setComments(updatedComments);
            })
            .catch((err) => console.error("Error fetching comments:", err))
            .finally(() => setIsLoading(false));
    }, [id]);

    const renderCommentsTree = (comments, parentId = null) => {
        return comments
            .filter(comment => comment.reply_to === parentId)
            .map(comment => (
                <div key={comment.id} className="comment-container">
                    <div className="comment">
                        <img src={comment.author_profile_pic} alt="Profile" className="comment-avatar" />
                        <div className="comment-body">
                            <p className="comment-author">{comment.author_name} <span className="comment-time">{new Date(comment.created_at).toLocaleString()}</span></p>
                            <p className="comment-content">{comment.content}</p>
                            <button className="btn btn-link reply-btn">Reply</button>
                        </div>
                    </div>
                    <div className="replies">{renderCommentsTree(comments, comment.id)}</div>
                </div>
            ));
    };

    return (
        <div className="container mt-4">
            {isLoading ? (
                <p>Loading article...</p>
            ) : article ? (
                <>
                    <h1>{article.title}</h1>
                    <h5 className="text-muted">By {article.author} • {new Date(article.created_at).toLocaleDateString()}</h5>
                    <p className="mt-3">{article.content}</p>
                    <p>
                        <strong>Tags: </strong>
                        {article.tags.map((tag, index) => (
                            <span key={index} className="badge bg-secondary me-1">{tag}</span>
                        ))}
                    </p>

                    <hr />

                    <div className="comments-section">{renderCommentsTree(comments)}</div>
                </>
            ) : (
                <p>Article not found.</p>
            )}
        </div>
    );
}

export default ArticlePage;
