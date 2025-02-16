import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

const HomeRedirect = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        navigate("/login"); // Redirect to login if not authenticated
      } else if (user.role === "OW" || user.role === "AD") {
        navigate("/admin/home");
      } else {
        navigate("/employee/home");
      }
    }
  }, [user, loading, navigate]);

  return <p>Loading...</p>; // Show while redirecting
};

export default HomeRedirect;
