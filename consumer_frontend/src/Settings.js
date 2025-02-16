import React, { useState } from 'react';
import axios from 'axios';
import Logout from './Logout';

function Settings() {
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    return (
        <div className="settings-dropdown">
            <h3>Settings</h3>
            <Logout />
        </div>
    );
}

export default Settings;