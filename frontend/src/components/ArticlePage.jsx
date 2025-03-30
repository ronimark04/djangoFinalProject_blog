import { useEffect, useState, useContext } from "react";
import { getArticleById, deleteArticle } from "../services/articleService";
import { getComments, createComment, editComment, deleteComment } from "../services/commentService";
import { useParams, useNavigate } from "react-router-dom";
import AuthContext from "../context/AuthContext";
import "bootstrap/dist/css/bootstrap.min.css";
import "./style/ArticlePage.css";
import { toast } from "react-toastify";


const BASE_BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://127.0.0.1:8000";

function ArticlePage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user, groups, isSuperuser } = useContext(AuthContext);
    const [article, setArticle] = useState(null);
    const [comments, setComments] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [newComment, setNewComment] = useState("");
    const [editingComment, setEditingComment] = useState(null);
    const [replyingTo, setReplyingTo] = useState(null);
    const [replyText, setReplyText] = useState("");

    useEffect(() => {
        setIsLoading(true);
        getArticleById(id)
            .then((res) => setArticle(res.data))
            .catch((err) => console.error("Error fetching article:", err));
        fetchComments();
    }, [id]);

    const fetchComments = () => {
        getComments(id)
            .then((res) => {
                const processComments = (comments) => {
                    return comments.map(comment => ({
                        ...comment,
                        author_profile_pic: comment.author_profile_pic
                            ? `${BASE_BACKEND_URL}${comment.author_profile_pic}`
                            : null,
                        replies: comment.replies ? processComments(comment.replies) : []
                    }));
                };
                setComments(processComments(res.data));
            })
            .catch((err) => console.error("Error fetching comments:", err))
            .finally(() => setIsLoading(false));
    };

    const handleDeleteArticle = () => {
        if (window.confirm("Are you sure you want to delete this article?")) {
            deleteArticle(id)
                .then(() => {
                    navigate("/");
                    toast("Article Deleted Successfully");
                })
                .catch(err => console.error("Error deleting article:", err));
        }
    };

    const handlePostComment = () => {
        if (!newComment.trim()) return;
        createComment(id, newComment)
            .then(() => {
                setNewComment("");
                fetchComments();
            })
            .catch(err => console.error("Error posting comment:", err));
    };

    const handleEditComment = (commentId) => {
        if (!editingComment.text.trim()) return;
        editComment(commentId, editingComment.text)
            .then(() => {
                setEditingComment(null);
                fetchComments();
            })
            .catch(err => console.error("Error editing comment:", err));
    };

    const handleDeleteComment = (commentId) => {
        if (window.confirm("Are you sure you want to delete this comment?")) {
            deleteComment(commentId)
                .then(() => {
                    fetchComments();
                    toast("Comment Deleted Successfully");
                })
                .catch(err => console.error("Error deleting comment:", err));
        }
    };

    const handleReply = (parentId) => {
        if (!replyText.trim()) return;
        createComment(id, replyText, parentId)
            .then(() => {
                setReplyingTo(null);
                setReplyText("");
                fetchComments();
            })
            .catch(err => console.error("Error posting reply:", err));
    };

    const toggleEdit = (comment) => {
        setEditingComment(editingComment?.id === comment.id ? null : { id: comment.id, text: comment.content });
    };

    const toggleReply = (commentId) => {
        setReplyingTo(replyingTo === commentId ? null : commentId);
    };

    const renderCommentsTree = (comments) => {
        return comments.map(comment => (
            <div key={comment.id} className="comment-container">
                <div className="comment">
                    {comment.author_profile_pic && (
                        <img
                            src={comment.author_profile_pic}
                            alt="Profile"
                            className="comment-avatar"
                        />
                    )}
                    <div className="comment-body">
                        <p className="comment-author">
                            {comment.author_name} <span className="comment-time">{new Date(comment.created_at).toLocaleString()}</span>
                        </p>
                        {editingComment?.id === comment.id ? (
                            <>
                                <textarea
                                    className="form-control"
                                    value={editingComment.text}
                                    onChange={(e) => setEditingComment({ ...editingComment, text: e.target.value })}
                                />
                                <button className="btn btn-success btn-sm mt-2" onClick={() => handleEditComment(comment.id)}>
                                    Post
                                </button>
                            </>
                        ) : (
                            <p className="comment-content">{comment.content}</p>
                        )}
                        <div className="d-flex align-items-center gap-3">
                            {(isSuperuser || groups.includes("Moderators") || groups.includes("Editors") || user?.username === comment.author_name) && (
                                <button className="btn btn-link text-secondary p-0" style={{ textDecoration: "none" }} onClick={() => toggleEdit(comment)}>
                                    ✏️ Edit
                                </button>
                            )}
                            {(isSuperuser || groups.includes("Moderators") || groups.includes("Editors") || groups.includes("Members")) && (
                                <button className="btn btn-link text-secondary p-0" style={{ textDecoration: "none" }} onClick={() => toggleReply(comment.id)}>
                                    💬 Reply
                                </button>
                            )}
                            {(isSuperuser || groups.includes("Moderators")) && (
                                <button className="btn btn-link text-secondary p-0" style={{ textDecoration: "none" }} onClick={() => handleDeleteComment(comment.id)}>
                                    🗑️ Delete
                                </button>
                            )}
                        </div>
                        {replyingTo === comment.id && (
                            <div className="mt-2">
                                <textarea
                                    className="form-control"
                                    value={replyText}
                                    onChange={(e) => setReplyText(e.target.value)}
                                />
                                <button className="btn btn-primary btn-sm mt-2" onClick={() => handleReply(comment.id)}>
                                    Post
                                </button>
                            </div>
                        )}
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
                            <span
                                key={index}
                                className="badge bg-secondary me-1"
                                style={{ cursor: "pointer" }}
                                onClick={() => navigate(`/search?query=${tag}`)}
                            >
                                {tag}
                            </span>
                        ))}
                    </p>

                    {(isSuperuser || groups.includes("Moderators") || groups.includes("Editors")) && (
                        <div className="d-flex justify-content-between mb-3">
                            <button className="btn btn-warning btn-sm" onClick={() => navigate(`/edit-article/${id}`)}>
                                ✏️ Edit
                            </button>
                            {(isSuperuser || groups.includes("Moderators")) && (
                                <button className="btn btn-danger btn-sm" onClick={handleDeleteArticle}>
                                    🗑️ Delete
                                </button>
                            )}
                        </div>
                    )}

                    <hr />

                    <div className="mb-4">
                        <textarea
                            className="form-control"
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="Write a comment..."
                        />
                        <button className="btn btn-primary mt-2" onClick={handlePostComment}>
                            Comment
                        </button>
                    </div>

                    <div className="comments-section">{renderCommentsTree(comments)}</div>
                </>
            ) : (
                <p>Article not found.</p>
            )}
        </div>
    );
}

export default ArticlePage;
