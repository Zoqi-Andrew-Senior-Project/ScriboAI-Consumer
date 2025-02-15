import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

const ProtectedRoute = ({ children }) => {
    const { user, loading } = useAuth();

    if (loading) return <p>Loading...</p>;  // Wait for auth check
    return user ? children : <Navigate to="/" replace />;
};

export default ProtectedRoute;