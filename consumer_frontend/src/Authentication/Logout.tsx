import React, { useState } from 'react';
import axios from 'axios';

function Logout() {
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    return (
        <button 
            className="bg-button-primary-bg hover:bg-button-hover text-button-primary-txt font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full"
            onClick={() => {
                axios.post(`${import.meta.env.VITE_BACKEND_ADDRESS}/auth/logout/`, {}, { withCredentials: true })
                    .then(() => {
                        setMessage('Logout successful!');
                        window.location.reload();
                    })
                    .catch(() => setError('Logout failed. Please try again.'));
            }}
        >Logout</button>
    );
}

export default Logout;