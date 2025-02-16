import React, { useState } from 'react';
import axios from 'axios';

function Logout() {
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    return (
        <button className="btn btn-secondary" onClick={() => {
            axios.post(process.env.REACT_APP_BACKEND_ADDRESS + '/api/auth/logout/', {}, { withCredentials: true })
                .then(() => {
                    setMessage('Logout successful!');
                    window.location.reload();
                })
                .catch(() => setError('Logout failed. Please try again.'));
        }}>Logout</button>
    );
}

export default Logout;