export const getCSRFToken = async () => {
    try {
        const response = await fetch(process.env.REACT_APP_BACKEND_ADDRESS + '/api/auth/csrf/', {
            credentials: "include",
        });

        if (!response.ok) {
            throw new Error('Failed to fetch CSRF token');
        }
        
        const data = await response.json()
        console.log(data.csrfToken);
        return data.csrfToken;
    } catch (error) {
        console.error('Error fetching CSRF token:', error);
        return null;
    }
};