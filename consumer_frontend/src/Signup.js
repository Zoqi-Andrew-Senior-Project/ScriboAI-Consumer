import React, { useState } from 'react';
import axios from 'axios';

function Signup() {
    const [formData, setFormData] = useState({ username: '', email: '', password: '' });
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');

        try {
            // Make a POST request to the backend API for user registration
            const response = await axios.post('http://137.184.77.182/api/authentication', formData);
            
            // Set a success message on successful signup
            setMessage('Signup successful!');
            setFormData({ username: '', email: '', password: '' }); // Clear form

        } catch (error) {
            // Handle error and show an error message
            if (error.response && error.response.data) {
                setError(error.response.data.message || 'Signup failed. Please try again.');
            } else {
                setError('An unexpected error occurred. Please try again.');
            }
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

                {/* Right Column: Signup Form */}
                <div className="col-lg-6 d-flex flex-column align-items-center justify-content-center">
                    <div className="form-container"> {/* Added container div for styling */}
                        <h2>Sign Up</h2>
                        <form onSubmit={handleSubmit} className="w-100">
                            <div className="mb-3">
                                <label>Username</label>
                                <input
                                    type="text"
                                    name="username"
                                    value={formData.username}
                                    onChange={handleChange}
                                    className="form-control"
                                    required
                                />
                            </div>
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
                            <div className="mb-3">
                                <label>Password</label>
                                <input
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    className="form-control"
                                    required
                                />
                            </div>
                            <button type="submit" className="btn btn-primary w-100">Sign Up</button>
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