import React, { useState } from 'react';
import axios from 'axios';

function Logout() {
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    return (
        <div className="container-fluid main-content d-flex align-items-center">
            <button className="btn btn-secondary" onClick={() => {
                axios.post(process.env.REACT_APP_BACKEND_ADDRESS + '/api/auth/logout/', {}, { withCredentials: true })
                    .then(() => setMessage('Logout successful!'))
                    .catch(() => setError('Logout failed. Please try again.'));
            }}>Logout</button>
        </div>
    );
}

export default Logout;