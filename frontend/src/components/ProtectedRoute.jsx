import { Navigate } from "react-router-dom";
import AuthContext from "../context/AuthContext";

function ProtectedRoute({ children, allowedGroups }) {
    const { groups, isLoading, isSuperuser } = useContext(AuthContext);

    if (isLoading) {
        return <p>Loading...</p>;
    }

    const isAuthorized = isSuperuser || groups.some(group => allowedGroups.includes(group));

    return isAuthorized ? children : <Navigate to="/" />;
}

export default ProtectedRoute;
