import React, { useState } from 'react';
import './App.css';
import { Link } from 'react-router-dom';
import axios from 'axios';

const OrganizationPrompt = ({ formData, handleChange }) => {
    return (
        <div>
            <h1>Tell us about your organization!</h1>
            <form>
                <div className="form-group">
                    <label htmlFor="organization">Organization</label>
                    <input type="text" id="organization" name="name" value={formData.name} onChange={handleChange} required />
                </div>
            </form>
        </div>
    )
}

const OwnerPrompt = ({ formData, handleChange }) => {
    return (
        <div>
            <h1>Let's create your account!</h1>
            <form>
                <div className="form-group">
                    <label htmlFor="first_name">First Name</label>
                    <input type="text" id="first_name" name="first_name" value={formData.first_name} onChange={handleChange} required />
                </div>
                <div className="form-group">
                    <label htmlFor="last_name">Last Name</label>
                    <input type="text" id="last_name" name="last_name" value={formData.last_name} onChange={handleChange} required />
                </div>
                <div className="form-group">
                    <label htmlFor="email">Email</label>
                    <input type="text" id="email" name="email" value={formData.email} onChange={handleChange} required />
                </div>
                <div className="form-group">
                    <label htmlFor="password">Password</label>
                    <input type="text" id="password" name="password" value={formData.password} onChange={handleChange} required />
                </div>
            </form>
        </div>
    )
}

function CreateOrganization() {
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        email: '',
        password: '',
        name: ''
    });

    const [message, setMessage] = useState('');
    const [status, setStatus] = useState(null);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({ ...prevData, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log(formData);

        axios.post('http://localhost:8000/api/organization/create-organization/', formData)
            .then(response => {
                setMessage(response.data.message);
                setStatus('success')
                setFormData({
                    first_name: '',
                    last_name: '',
                    email: '',
                    password: '',
                    name: ''
                });
            })
            .then(data => {
                console.log(data.data);
            })
            .catch(error => {
                try {
                    setMessage('Error: ' + error.response.data.message + "\n" + JSON.stringify(error.response.data.data));
                    setStatus('error')
                } catch (error) {
                    setStatus('error')
                }
            });
    }

    return (
        <div>
            <div className="course-outline" id="outline menu">
                <div className="outline-menu">
                    <h2>Create an Organization!</h2>
                    <OrganizationPrompt formData={formData} handleChange={handleChange} />
                    <OwnerPrompt formData={formData} handleChange={handleChange} />
                    <button
                        className="submit-btn mt-4"
                        onClick={handleSubmit}
                        disabled={false}
                        type="submit"
                    >
                        Submit
                    </button>
                    {status === 'success' && (
                        <div id="success-message" className="message success">
                            <p>{message}</p>
                            <Link to="/signup" className="btn btn-primary btn-big mb-3 w-75">Log in now!</Link>
                        </div>
                    )}
                    {status === 'error' && (
                        <div id="error-message" className="message error">
                            <p>{message}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
      );
}
    
export default CreateOrganization;