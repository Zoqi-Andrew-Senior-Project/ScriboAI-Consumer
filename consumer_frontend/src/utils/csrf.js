const getCSRFToken = async () => {
    const response = await fetch(process.env.REACT_APP_BACKEND_ADDRESS + '/api/auth/csrf/', {
        credentials: "include",
    });
    const data = await response.json();
};