import React from 'react';
import Logout from './Authentication/Logout';
import Login from './Authentication/Login';
import { useAuth } from './utils/AuthContext';
import { useNavigate } from 'react-router-dom';

function Settings() {
    const { user, loading } = useAuth();
    const navigate = useNavigate();

    if (loading) {
        return <div className="text-center text-gray-600">Loading...</div>;
    }

    return (
        <div className="absolute right-30 mt-2 p-4 shadow-md rounded-lg bg-tertiray outline-3 outline-accent-2">
            <h3 className="text-xl font-semibold mb-4">Settings</h3>
            { user && (
                <div>
                    <h2 className="text-lg mb-4">User: {user?.user_name}</h2>
                    <Logout />
                </div>
            ) || (
                <div>
                    <button 
                        className='bg-button-primary-bg hover:bg-button-hover text-button-primary-txt font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full'
                        onClick={() => {
                            navigate('/login');
                            window.location.reload();
                        }}
                    >
                        Login
                    </button>
                </div>
            )}
        </div>
    );
}

export default Settings;