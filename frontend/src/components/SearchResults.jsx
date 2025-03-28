import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getArticlesBySearch } from "../services/articleService";
import "bootstrap/dist/css/bootstrap.min.css";

function SearchResults() {
    const { query } = useParams();
    const [articles, setArticles] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        setIsLoading(true);
        getArticlesBySearch(query)
            .then((res) => setArticles(res.data.results))
            .catch((err) => console.error("Error fetching search results:", err))
            .finally(() => setIsLoading(false));
    }, [query]);

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
                        <ArticlePreview key={article.id} article={article} navigate={navigate} />
                    ))}
                </div>
            )}
        </div>
    );
}

function ArticlePreview({ article, navigate }) {
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
                </div>
            </div>
        </div>
    );
}

export default SearchResults;
