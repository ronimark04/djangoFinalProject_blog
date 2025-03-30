import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createArticle } from "../services/articleService";
import AuthContext from "../context/AuthContext";
import ProtectedRoute from "./ProtectedRoute";
import "bootstrap/dist/css/bootstrap.min.css";
import { toast } from "react-toastify";


function CreateArticle() {
    const { user, groups, permissions } = useContext(AuthContext);
    const navigate = useNavigate();
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [tags, setTags] = useState("");
    const [error, setError] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
    }, [user, groups, permissions]);


    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        const articleData = {
            title,
            content,
            tags: tags.split(",").map(tag => tag.trim()),
        };

        try {
            await createArticle(articleData);
            navigate("/");
        } catch (err) {
            setError("Failed to create article. Please try again.");
            console.error("Error creating article:", err);
        } finally {
            setIsSubmitting(false);
            toast("Article Created Successfully");
        }
    };

    return (
        <ProtectedRoute allowedGroups={["Moderators"]}>
            <div className="container mt-5">
                <div className="row justify-content-center">
                    <div className="col-md-8">
                        <div className="card shadow-sm p-4">
                            <h2 className="text-center">Create New Article</h2>

                            {error && <p className="text-danger text-center">{error}</p>}

                            <form onSubmit={handleSubmit}>
                                <div className="mb-3">
                                    <label className="form-label">Title</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        required
                                    />
                                </div>

                                <div className="mb-3">
                                    <label className="form-label">Content</label>
                                    <textarea
                                        className="form-control"
                                        rows="6"
                                        value={content}
                                        onChange={(e) => setContent(e.target.value)}
                                        required
                                    ></textarea>
                                </div>

                                <div className="mb-3">
                                    <label className="form-label">Tags (comma-separated)</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={tags}
                                        onChange={(e) => setTags(e.target.value)}
                                    />
                                </div>

                                <div className="text-center mt-4">
                                    <button type="submit" className="btn btn-primary w-50" disabled={isSubmitting}>
                                        {isSubmitting ? "Submitting..." : "Post Article"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    );
}

export default CreateArticle;
