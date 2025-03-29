import { useEffect, useState } from "react";
import { getArticleById, getComments } from "../services/articleService";
import { useParams, useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "./style/ArticlePage.css";

const BASE_BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://127.0.0.1:8000";

function ArticlePage() {
    const { id } = useParams();
    const navigate = useNavigate();
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
                const processComments = (comments) => {
                    return comments.map(comment => ({
                        ...comment,
                        author_profile_pic: comment.author_profile_pic
                            ? `${BASE_BACKEND_URL}${comment.author_profile_pic}`
                            : "/default_profile.png",
                        replies: comment.replies ? processComments(comment.replies) : []
                    }));
                };

                setComments(processComments(res.data));
            })
            .catch((err) => console.error("Error fetching comments:", err))
            .finally(() => setIsLoading(false));
    }, [id]);

    const renderCommentsTree = (comments) => {
        return comments.map(comment => (
            <div key={comment.id} className="comment-container">
                <div className="comment">
                    <img src={comment.author_profile_pic} alt="Profile" className="comment-avatar" />
                    <div className="comment-body">
                        <p className="comment-author">{comment.author_name} <span className="comment-time">{new Date(comment.created_at).toLocaleString()}</span></p>
                        <p className="comment-content">{comment.content}</p>
                        <button className="btn btn-link reply-btn">💬 Reply</button>
                    </div>
                </div>
                {comment.replies.length > 0 && (
                    <div className="replies">{renderCommentsTree(comment.replies)}</div>
                )}
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
                            <span key={index} className="badge bg-secondary me-1" style={{ cursor: "pointer" }}
                                onClick={() => navigate(`/tag/${tag}`)}>
                                {tag}
                            </span>
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
