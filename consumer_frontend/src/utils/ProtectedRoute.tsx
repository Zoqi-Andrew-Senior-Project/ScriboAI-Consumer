import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import { ReactNode } from "react";

interface ProtectedRouteProps {
    children: ReactNode;
  }

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
    const { user, loading } = useAuth();

    if (loading) return <p>Loading...</p>;  // Wait for auth check
    return user ? children : <Navigate to="/" replace />;
};

export const ProtectedRouteAdmin = ({ children }: ProtectedRouteProps) => {
    const { user, loading } = useAuth();

    if (loading) return <p>Loading...</p>;  // Wait for auth check
    return user && (user.role === "OW" || user.role === "AD" ) ? children : <Navigate to="/" replace />;
}

export const ProtectedRouteEmployee = ({ children }: ProtectedRouteProps) => {
    const { user, loading } = useAuth();

    if (loading) return <p>Loading...</p>;  // Wait for auth check
    return user && (user.role === "EM") ? children : <Navigate to="/" replace />;
}