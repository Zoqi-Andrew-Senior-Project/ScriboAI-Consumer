const getCsrfToken = async () => {
    await fetch(process.env.REACT_APP_BACKEND_ADDRESS + '/api/auth/csrf/', {
        credentials: "include",
    }),
}

