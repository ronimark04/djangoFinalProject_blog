import { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getArticlesBySearch, deleteArticle } from "../services/articleService";
import { getComments } from "../services/commentService";
import AuthContext from "../context/AuthContext";
import "bootstrap/dist/css/bootstrap.min.css";
import { toast } from "react-toastify";


function SearchResults() {
    const { query } = useParams();
    const [articles, setArticles] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();
    const { groups, isSuperuser } = useContext(AuthContext);

    useEffect(() => {
        setIsLoading(true);
        getArticlesBySearch(query)
            .then((res) => setArticles(res.data.results))
            .catch((err) => console.error("Error fetching search results:", err))
            .finally(() => setIsLoading(false));
    }, [query]);

    const handleDelete = (id) => {
        if (window.confirm("Are you sure you want to delete this article?")) {
            deleteArticle(id)
                .then(() => {
                    setArticles((prev) => prev.filter(article => article.id !== id));
                    toast("Article Deleted Successfully");
                })
                .catch(err => console.error("Error deleting article:", err));
        }
    };

    return (
        <div className="container mt-4">
            <h1 className="mb-4">Search Results for "{query}"</h1>

            {isLoading ? (
                <p>Loading results...</p>
            ) : articles.length === 0 ? (
                <p>No articles found.</p>
            ) : (
                <div className="row">
                    {articles.map((article) => (
                        <ArticlePreview
                            key={article.id}
                            article={article}
                            navigate={navigate}
                            groups={groups}
                            isSuperuser={isSuperuser}
                            onDelete={handleDelete}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

function ArticlePreview({ article, navigate, groups, isSuperuser, onDelete }) {
    const [commentCount, setCommentCount] = useState(null);

    useEffect(() => {
        getComments(article.id)
            .then((res) => {
                const countComments = (comments) =>
                    comments.reduce((count, comment) => count + 1 + countComments(comment.replies || []), 0);
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
                            <span
                                key={index}
                                className="badge bg-secondary me-1"
                                style={{ cursor: "pointer" }}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    navigate(`/search/${tag}`);
                                }}
                            >
                                {tag}
                            </span>
                        ))}
                    </p>

                    <p className="text-muted">💬 {commentCount !== null ? commentCount : "Loading..."} comments</p>

                    <div className="d-flex justify-content-between mt-3">
                        {(groups.includes("Editors") || groups.includes("Moderators") || isSuperuser) && (
                            <button
                                className="btn btn-warning btn-sm"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    navigate(`/edit-article/${article.id}`);
                                }}
                            >
                                ✏️ Edit
                            </button>
                        )}

                        {(groups.includes("Moderators") || isSuperuser) && (
                            <button
                                className="btn btn-danger btn-sm"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onDelete(article.id);
                                }}
                            >
                                🗑️ Delete
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default SearchResults;
