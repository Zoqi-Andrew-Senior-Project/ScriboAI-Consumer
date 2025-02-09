import React, { useState } from 'react';
import axios from 'axios';

function Signup() {
    const [formData, setFormData] = useState({ username: '', email: '', password: '' });
    const [loginData, setLoginData] = useState({ username: '', password: '' });    
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [isSignup, setIsSignup] = useState(true); 

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (isSignup) {
            setFormData({ ...formData, [name]: value });
        } else {
            setLoginData({ ...loginData, [name]: value });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');

        try {
            const endpoint = isSignup
                ? process.env.BACKEND_ADDRESS + '/api/authentication/register/' 
                : process.env.BACKEND_ADDRESS + '/api/authentication/login/';    

            const data = isSignup ? formData : loginData;

            const response = await axios.post(endpoint, data);
            setMessage(isSignup ? 'Signup successful!' : 'Login successful!');
            if (isSignup) {
                setFormData({ username: '', email: '', password: '' });
            } else {
                setLoginData({ username: '', password: '' });
            }

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

                {/* Right Column: Signup or Login Form */}
                <div className="col-lg-6 d-flex flex-column align-items-center justify-content-center">
                    <div className="form-container">
                        <div className="btn-group mb-3" role="group">
                            <button
                                type="button"
                                className={`btn ${isSignup ? 'btn-primary' : 'btn-secondary'}`}
                                onClick={() => setIsSignup(true)}
                            >
                                Sign Up
                            </button>
                            <button
                                type="button"
                                className={`btn ${!isSignup ? 'btn-primary' : 'btn-secondary'}`}
                                onClick={() => setIsSignup(false)}
                            >
                                Log In
                            </button>
                        </div>

                        
                        <form onSubmit={handleSubmit} className="w-100">
                            <div className="mb-3">
                                <label>Username</label>
                                <input
                                    type="text"
                                    name="username"
                                    value={isSignup ? formData.username : loginData.username}
                                    onChange={handleChange}
                                    className="form-control"
                                    required
                                />
                            </div>
                            {isSignup && (
                                <div className="mb-3">
                                    <label>Email</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        className="form-control"
                                        required
                                    />
                                </div>
                            )}
                            <div className="mb-3">
                                <label>Password</label>
                                <input
                                    type="password"
                                    name="password"
                                    value={isSignup ? formData.password : loginData.password}
                                    onChange={handleChange}
                                    className="form-control"
                                    required
                                />
                            </div>
                            <button type="submit" className="btn btn-primary w-100">
                                {isSignup ? 'Sign Up' : 'Log In'}
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

export default Signup;