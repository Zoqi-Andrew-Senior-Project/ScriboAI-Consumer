export const getCSRFToken = async () => {
    try {
        const response = await fetch(`${import.meta.env.VITE_BACKEND_ADDRESS}/auth/csrf/`, {
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