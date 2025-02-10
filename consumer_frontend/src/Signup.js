import React, { useState } from 'react';
import axios from 'axios';

function Login() {
    const [loginData, setLoginData] = useState({ username: '', password: '' });
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setLoginData({ ...loginData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');

        try {
            console.log(process.env.REACT_APP_BACKEND_ADDRESS);
            const endpoint = process.env.REACT_APP_BACKEND_ADDRESS + '/api/authentication/login/';
            const response = await axios.post(endpoint, loginData);
            setMessage('Login successful!');
            setLoginData({ username: '', password: '' });
        } catch (error) {
            setError(error.response?.data?.error || 'An error occurred. Please try again.');
        }
    };

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
                        <form onSubmit={handleSubmit} className="w-100">
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
