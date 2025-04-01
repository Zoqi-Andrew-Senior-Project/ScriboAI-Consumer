import { createContext, useContext, useEffect, useState, useCallback, ReactNode  } from "react";

interface User {
    "first_name": string,
    "last_name": string,
    "email": string,
    "role": string,
    "organization": string,
    "status": string,
    "user_name": string
}

interface AuthContextType {
    user: User | null;
    loading: boolean;
    fetchUser: () => Promise<void>;
}

interface AuthProviderProps {
    children: ReactNode;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Memoized fetch function
    const fetchUser = useCallback(async () => {
        try {
            const response = await fetch(`${import.meta.env.VITE_BACKEND_ADDRESS}/api/org/member/`, {
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

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
      throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};