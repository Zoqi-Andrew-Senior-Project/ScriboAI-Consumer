import { createContext, useContext, useEffect, useState, useCallback } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Memoized fetch function
    const fetchUser = useCallback(async () => {
        try {
            const response = await fetch(process.env.REACT_APP_BACKEND_ADDRESS + "/api/org/member/", {
                credentials: "include",
            });

            if (!response.ok) throw new Error("Not authenticated");

            const data = await response.json();
            setUser(data);
        } catch (error) {
            console.error("User not authenticated:", error);
            setUser(null);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchUser();
    }, [fetchUser]);

    return <AuthContext.Provider value={{ user, loading, fetchUser }}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);