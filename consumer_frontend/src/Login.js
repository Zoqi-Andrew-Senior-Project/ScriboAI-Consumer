import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { getCSRFToken } from "./utils/csrf";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./utils/AuthContext";

function Login() {
    const [loginData, setLoginData] = useState({ username: '', password: '' });
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { user, fetchUser } = useAuth();

    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setLoginData({ ...loginData, [name]: value });
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');
        setLoading(true); 

        const csrfToken = await getCSRFToken();
        if (!csrfToken) {
            setError('Failed to get CSRF token');
            setLoading(false);
            return;
        }

        try {
            const endpoint = process.env.REACT_APP_BACKEND_ADDRESS + '/api/auth/login/';
            const response = await axios.post(endpoint, loginData, {
                withCredentials: true,
                headers: { 'Content-Type': 'application/json' },

            });
            setMessage('Login successful!');
            setLoginData({ username: '', password: '' });

            await fetchUser();
        } catch (error) {
            setError(error.response?.data?.error || 'An error occurred. Please try again. \n' + error.message);
        }
    };

    useEffect(() => {
        if (user) {
            navigate('/home');
        }
    }, [user, navigate]);

    return (
        <div className="container-fluid main-content d-flex align-items-center">
            <div className="row w-100">
                {/* Left Column: Logo and Welcome Message */}
                <div className="col-lg-6 d-flex flex-column align-items-center justify-content-center text-center mb-4">
                    <div className="logo-placeholder mb-3"></div>
                    <h1>Welcome to Scribo!</h1>
                    <p>Your training solutions are just a few clicks away.</p>
                </div>

                {/* Right Column: Login Form */}
                <div className="col-lg-6 d-flex flex-column align-items-center justify-content-center">
                    <div className="form-container">
                        <form onSubmit={handleLogin} className="w-100">
                            <div className="mb-3">
                                <label>Username</label>
                                <input
                                    type="text"
                                    name="username"
                                    value={loginData.username}
                                    onChange={handleChange}
                                    className="form-control"
                                    required
                                />
                            </div>
                            <div className="mb-3">
                                <label>Password</label>
                                <input
                                    type="password"
                                    name="password"
                                    value={loginData.password}
                                    onChange={handleChange}
                                    className="form-control"
                                    required
                                />
                            </div>
                            <button type="submit" className="btn btn-primary w-100">
                                Log In
                            </button>
                        </form>
                        {message && <p className="mt-3 text-success">{message}</p>}
                        {error && <p className="mt-3 text-danger">{error}</p>}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Login;