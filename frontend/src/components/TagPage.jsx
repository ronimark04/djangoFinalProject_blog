import { useEffect, useState, useContext } from "react";
import { getArticlesByTag, deleteArticle } from "../services/articleService";
import { getComments } from "../services/commentService";
import { useNavigate, useParams } from "react-router-dom";
import AuthContext from "../context/AuthContext";
import "bootstrap/dist/css/bootstrap.min.css";

function TagPage() {
    const { tag } = useParams();
    const [articles, setArticles] = useState([]);
    const [nextPage, setNextPage] = useState(null);
    const [prevPage, setPrevPage] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();
    const { groups } = useContext(AuthContext);

    const fetchArticles = (url = null) => {
        setIsLoading(true);
        getArticlesByTag(tag, url)
            .then((res) => {
                setArticles(res.data.results);
                setNextPage(res.data.next);
                setPrevPage(res.data.previous);
            })
            .catch((err) => console.error("Error fetching articles:", err))
            .finally(() => setIsLoading(false));
    };

    useEffect(() => {
        fetchArticles();
    }, [tag]);

    const handleDelete = (id) => {
        if (window.confirm("Are you sure you want to delete this article?")) {
            deleteArticle(id)
                .then(() => {
                    setArticles((prevArticles) => prevArticles.filter(article => article.id !== id));
                })
                .catch(err => console.error("Error deleting article:", err));
        }
    };

    return (
        <div className="container mt-4">
            <h1 className="mb-4"><span className="text-primary">#{tag}</span> Articles</h1>

            {isLoading ? (
                <p>Loading articles...</p>
            ) : (
                <div className="row">
                    {articles.map((article) => (
                        <ArticlePreview key={article.id} article={article} navigate={navigate} groups={groups} onDelete={handleDelete} />
                    ))}
                </div>
            )}

            <div className="d-flex justify-content-between mt-4">
                <button className="btn btn-primary" onClick={() => fetchArticles(prevPage)} disabled={!prevPage}>
                    ← Previous
                </button>
                <button className="btn btn-primary" onClick={() => fetchArticles(nextPage)} disabled={!nextPage}>
                    Next →
                </button>
            </div>
        </div>
    );
}

function ArticlePreview({ article, navigate, groups, onDelete }) {
    const [commentCount, setCommentCount] = useState(null);
    const { isSuperuser } = useContext(AuthContext);

    useEffect(() => {
        getComments(article.id)
            .then((res) => {
                const countComments = (comments) => {
                    return comments.reduce((count, comment) => count + 1 + countComments(comment.replies || []), 0);
                };
                setCommentCount(countComments(res.data));
            })
            .catch((err) => console.error(`Error fetching comments for ${article.id}:`, err));
    }, [article.id]);

    return (
        <div className="col-md-4 mb-3">
            <div className="card shadow-sm" style={{ cursor: "pointer" }}>
                <div className="card-body" onClick={() => navigate(`/article/${article.id}`)}>
                    <h5 className="card-title">{article.title}</h5>
                    <h6 className="card-subtitle mb-2 text-muted">By {article.author}</h6>
                    <p className="card-text">{article.content.split(" ").slice(0, 50).join(" ")}...</p>

                    <p>
                        <strong>Tags: </strong>
                        {article.tags.map((tag, index) => (
                            <span key={index} className="badge bg-secondary me-1" style={{ cursor: "pointer" }}
                                onClick={(e) => { e.stopPropagation(); navigate(`/tag/${tag}`); }}>
                                {tag}
                            </span>
                        ))}
                    </p>

                    <p className="text-muted">💬 {commentCount !== null ? commentCount : "Loading..."} comments</p>

                    <div className="d-flex justify-content-between mt-3">
                        {(groups.includes("Editors") || groups.includes("Moderators") || isSuperuser) && (
                            <button className="btn btn-warning btn-sm" onClick={(e) => { e.stopPropagation(); navigate(`/edit-article/${article.id}`); }}>
                                ✏️ Edit
                            </button>
                        )}

                        {(groups.includes("Moderators") || isSuperuser) && (
                            <button className="btn btn-danger btn-sm" onClick={(e) => { e.stopPropagation(); onDelete(article.id); }}>
                                🗑️ Delete
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default TagPage;
