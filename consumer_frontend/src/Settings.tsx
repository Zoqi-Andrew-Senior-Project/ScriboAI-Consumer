import React, { useState } from 'react';
import Logout from './Logout';
import { useAuth } from './utils/AuthContext';


function Settings() {
    const { user, loading } = useAuth();
    return (
        <div className="settings-dropdown">
            <h3>Settings</h3>
            <h2>User: {user?.user_name}</h2>
            <Logout />
        </div>
    );
}

export default Settings;