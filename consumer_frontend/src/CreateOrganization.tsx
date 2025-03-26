import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

interface FormData {
    first_name: string,
    last_name: string,
    email: string,
    password: string,
    name: string
}

interface PromptProps {
    formData: FormData,
    handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

const OrganizationPrompt: React.FC<PromptProps> = ({ formData, handleChange }) => {
    return (
        <div>
            <h1 className="text-2xl font-bold mb-4">Tell us about your organization!</h1>
            <form>
                <div className="mb-4">
                    <label htmlFor="organization" className="block text-gray-700 text-sm font-bold mb-2">Organization</label>
                    <input 
                        type="text"
                        id="organization"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required 
                        className="shadow appearance-none border rounded w-full py-2 px-3 bg-white text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-primary"
                    />
                </div>
            </form>
        </div>
    )
}

const OwnerPrompt: React.FC<PromptProps> = ({ formData, handleChange }) => {
    return (
        <div>
            <h1 className="text-2xl font-bold mb-4">Let's create your account!</h1>
            <form>
                <div className="mb-4">
                    <label htmlFor="first_name" className="block text-gray-700 text-sm font-bold mb-2">First Name</label>
                    <input type="text" id="first_name" name="first_name" value={formData.first_name} onChange={handleChange} required className="shadow appearance-none border rounded w-full py-2 px-3 bg-white text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-primary"/>
                </div>
                <div className="mb-4">
                    <label htmlFor="last_name" className="block text-gray-700 text-sm font-bold mb-2">Last Name</label>
                    <input type="text" id="last_name" name="last_name" value={formData.last_name} onChange={handleChange} required className="shadow appearance-none border rounded w-full py-2 px-3 bg-white text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-primary"/>
                </div>
                <div className="mb-4">
                    <label htmlFor="email" className="block text-gray-700 text-sm font-bold mb-2">Email</label>
                    <input type="text" id="email" name="email" value={formData.email} onChange={handleChange} required className="shadow appearance-none border rounded w-full py-2 px-3 bg-white text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-primary"/>
                </div>
                <div className="mb-4">
                    <label htmlFor="password" className="block text-gray-700 text-sm font-bold mb-2">Password</label>
                    <input type="password" id="password" name="password" value={formData.password} onChange={handleChange} required className="shadow appearance-none border rounded w-full py-2 px-3 bg-white text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-primary"/>
                </div>
            </form>
        </div>
    )
}

function CreateOrganization() {
    const [formData, setFormData] = useState<FormData>({
        first_name: '',
        last_name: '',
        email: '',
        password: '',
        name: ''
    });

    const [message, setMessage] = useState('');
    const [status, setStatus] = useState<string>("");

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({ ...prevData, [name]: value }));
    };

    const handleSubmit = (e: React.MouseEvent<HTMLButtonElement>) => {
        console.log(formData);

        axios.post(`${import.meta.env.VITE_BACKEND_ADDRESS}/api/org/organization/`, formData)
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
                console.log(data);
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
        <div className="flex items-center justify-center min-h-screen">
            <div className='bg-tertiary p-8 rounded-lg shadow-md w-full max-w-md'>
                <h2 className="text-3xl font-bold mb-6 text-center">Create an Organization!</h2>
                {status === '' && (
                    <div>
                        <OrganizationPrompt formData={formData} handleChange={handleChange} />
                        <OwnerPrompt formData={formData} handleChange={handleChange} />
                        <button
                            className="bg-button-primary-bg hover:bg-button-hover text-button-primary-txt font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full"
                            onClick={handleSubmit}
                            type="button"
                        >
                            Submit
                        </button>
                    </div>
                )}
                {status === 'success' && (
                    <div id="success-message" className="mt-6 space-y-3 text-green-950 w-full max-w-lg text-center">
                        <p>{message}</p>
                        <Link to="/login" 
                            className="block w-3/4 mx-auto bg-button-primary-bg text-button-primary-txt py-3 rounded-lg text-lg font-semibold hover:bg-button-hover"
                        >
                            Log in now!
                        </Link>
                    </div>
                )}
                {status === 'error' && (
                    <div id="error-message" className="mt-4 text-red-600">
                        <p>{message}</p>
                    </div>
                )}
            </div>
        </div>
      );
}
    
export default CreateOrganization;