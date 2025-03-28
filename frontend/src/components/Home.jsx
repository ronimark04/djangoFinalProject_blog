import { useEffect, useState } from "react";
import { getAllArticles, getComments } from "../services/articleService";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";

function Home() {
    const [articles, setArticles] = useState([]);
    const [nextPage, setNextPage] = useState(null);
    const [prevPage, setPrevPage] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    const fetchArticles = (url = null) => {
        setIsLoading(true);
        getAllArticles(url)
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
    }, []);

    return (
        <div className="container mt-4">
            <h1 className="mb-4">Latest Articles</h1>

            {isLoading ? (
                <p>Loading articles...</p>
            ) : (
                <div className="row">
                    {articles.map((article) => (
                        <ArticlePreview key={article.id} article={article} navigate={navigate} />
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

function ArticlePreview({ article, navigate }) {
    const [commentCount, setCommentCount] = useState(null);

    useEffect(() => {
        getComments(article.id)
            .then((res) => {
                if (Array.isArray(res.data)) {
                    setCommentCount(res.data.length);
                } else if (res.data.results) {
                    setCommentCount(res.data.results.length);
                } else {
                    setCommentCount(0);
                }
            })
            .catch((err) => console.error(`Error fetching comments for ${article.id}:`, err));
    }, [article.id]);

    return (
        <div className="col-md-4 mb-3">
            <div className="card shadow-sm" onClick={() => navigate(`/article/${article.id}`)} style={{ cursor: "pointer" }}>
                <div className="card-body">
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
                </div>
            </div>
        </div>
    );
}

export default Home;
