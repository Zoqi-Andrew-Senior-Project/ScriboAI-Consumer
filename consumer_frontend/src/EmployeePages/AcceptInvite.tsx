import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";
import { getCSRFToken } from "../utils/csrf";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../utils/AuthContext";

const AcceptInvite = () => {
    const { token } = useParams();
    const navigate = useNavigate();
    const { user, fetchUser } = useAuth();

    const [firstName, setFirstName] = useState<string>("");
    const [lastName, setLastName] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [confirmPassword, setConfirmPassword] = useState<string>("");
    const [errorMessage, setErrorMessage] = useState<string>("");
    const [statusMessage, setStatusMessage] = useState<string>("");
    const [loginData, setLoginData] = useState({ username: "", password: "" });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setErrorMessage("");
        setStatusMessage("");

        if (password !== confirmPassword) {
            setErrorMessage("Passwords do not match!");
            setLoading(false);
            return;
        }

        const payload = {
            token,
            first_name: firstName,
            last_name: lastName,
            password
        };

        try {
            const response = await axios.post(`${import.meta.env.VITE_BACKEND_ADDRESS}/org/member/`, payload);
            setStatusMessage("Successfully accepted the invite!");

            const data = {
                username: response.data.data.user_name,
                password: password
            }

            setFirstName("");
            setLastName("");
            setPassword("");
            setConfirmPassword("");

            // Automatically log the user in after account creation
            await handleLogin(data);
        } catch (error: any) {
            const errorMsg = error.response?.data?.message || "An error occurred. Please try again.";
            setErrorMessage(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    const handleLogin = async (data: { username: string, password: string}) => {
        setLoading(true);
        setErrorMessage("");
        setStatusMessage("");

        const csrfToken = await getCSRFToken();
        if (!csrfToken) {
            setErrorMessage('Failed to get CSRF token');
            setLoading(false);
            return;
        }

        try {
            const endpoint = `${import.meta.env.VITE_BACKEND_ADDRESS}/auth/login/`;
            const response = await axios.post(endpoint, data, {
                withCredentials: true,
                headers: { 'Content-Type': 'application/json' },
            });

            setStatusMessage('Login successful!');

            await fetchUser(); // Fetch user data after successful login
        } catch (error: any) {
            const errorMsg = error.response?.data?.message || 'An error occurred during login.';
            setErrorMessage(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) {
            navigate('/home');
        }
    }, [user, navigate]);

    return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="bg-tertiary p-8 rounded-lg shadow-lg w-full max-w-md">
                <h1 className="text-2xl font-semibold mb-4 text-center">Accept Invite</h1>
                <p className="text-center text-gray-700 mb-6">Please fill out your details to complete the invitation.</p>

                {statusMessage && (
                    <div className="mb-4 text-green-600 text-center">
                        {statusMessage}
                    </div>
                )}

                {errorMessage && (
                    <div className="mb-4 text-red-600 text-center">
                        {errorMessage}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">First Name:</label>
                        <input
                            type="text"
                            id="firstName"
                            name="firstName"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            required
                            className="mt-1 block w-full px-4 py-2 bg-tertiary-light/15 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-secondary/50"
                        />
                    </div>

                    <div>
                        <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">Last Name:</label>
                        <input
                            type="text"
                            id="lastName"
                            name="lastName"
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            required
                            className="mt-1 block w-full px-4 py-2 bg-tertiary-light/15 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-secondary/50"
                        />
                    </div>

                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password:</label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="mt-1 block w-full px-4 py-2 bg-tertiary-light/15 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-secondary/50"
                        />
                    </div>

                    <div>
                        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">Confirm Password:</label>
                        <input
                            type="password"
                            id="confirmPassword"
                            name="confirmPassword"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            className="mt-1 block w-full px-4 py-2 bg-tertiary-light/15 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-secondary/50"
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-primary hover:bg-button-hover text-white font-semibold py-2 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary/50"
                        disabled={loading}
                    >
                        {loading ? 'Processing...' : 'Submit'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AcceptInvite;
