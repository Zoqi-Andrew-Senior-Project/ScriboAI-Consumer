import React, { ChangeEvent, FormEvent, useEffect, useState } from 'react';
import axios from 'axios';
import { getCSRFToken } from "../utils/csrf";
import { useNavigate } from "react-router-dom";
import { useAuth } from '../utils/AuthContext';

function Login() {
    const [loginData, setLoginData] = useState({ username: '', password: '' });
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { user, fetchUser } = useAuth();

    const navigate = useNavigate();

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setLoginData({ ...loginData, [name]: value });
    };

    const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
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
            const endpoint = `${import.meta.env.VITE_BACKEND_ADDRESS}/api/auth/login/`;
            const response = await axios.post(endpoint, loginData, {
                withCredentials: true,
                headers: { 'Content-Type': 'application/json' },

            });
            setMessage('Login successful!');
            setLoginData({ username: '', password: '' });

            await fetchUser();
        } catch (error: unknown) {
            if (error instanceof Error) {
                setError(error.message || 'An error occurred. Please try again.');
            } else {
                setError('An unexpected error occurred.');
            }
        }
    };

    useEffect(() => {
        if (user) {
            navigate('/home');
        }
    }, [user, navigate]);

    return (
        <div className="flex justify-center min-h-screen">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-4xl p-4">
                {/* Left Column: Logo and Welcome Message */}
                <div className="flex flex-col justify-center items-center p-6">
                    <div className="w-24 h-24 rounded-full mx-auto mb-4 overflow-hidden">
                        <img src="/logo.png" alt="Scribo.AI Logo" className="w-full h-full object-cover" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">Welcome to Scribo!</h1>
                    <p className="text-lg text-gray-600">Your training solutions are just a few clicks away.</p>
                </div>

                {/* Right Column: Login Form */}
                <div className="flex flex-col justify-center items-center p-6">
                    <div className='bg-tertiary p-8 rounded-lg shadow-md w-full max-w-md'>
                        <form onSubmit={handleLogin} className="space-y-4">
                            <div className="space-y-2">
                                <label className="block text-gray-700">Username</label>
                                <input
                                    type="text"
                                    name="username"
                                    value={loginData.username}
                                    onChange={handleChange}
                                    className="shadow appearance-none border rounded w-full py-2 px-3 bg-white text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-primary"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="block text-gray-700">Password</label>
                                <input
                                    type="password"
                                    name="password"
                                    value={loginData.password}
                                    onChange={handleChange}
                                    className="shadow appearance-none border rounded w-full py-2 px-3 bg-white text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-primary"
                                    required
                                />
                            </div>
                            <button
                                type="submit"
                                className="bg-button-primary-bg hover:bg-button-hover text-button-primary-txt font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full"
                            >
                                Log In
                            </button>
                        </form>
                        {message && <p className="mt-4 text-green-600">{message}</p>}
                        {error && <p className="mt-4 text-red-600">{error}</p>}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Login;