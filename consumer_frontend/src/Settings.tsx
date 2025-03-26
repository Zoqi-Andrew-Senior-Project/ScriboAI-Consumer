import React from 'react';
import Logout from './Authentication/Logout';
import { useAuth } from './utils/AuthContext';

function Settings() {
    const { user, loading } = useAuth();

    if (loading) {
        return <div className="text-center text-gray-600">Loading...</div>;
    }

    return (
        <div className="absolute right-0 mt-2 p-4 shadow-md rounded-lg bg-secondary">
            <h3 className="text-xl font-semibold mb-4">Settings</h3>
            <h2 className="text-lg mb-4">User: {user?.user_name}</h2>
            <Logout />
        </div>
    );
}

export default Settings;