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
                    <label htmlFor="organization" className="block text-gray-700 text-sm font-bold mb-2">Name of your Organization</label>
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

const NamePrompt: React.FC<PromptProps> = ({ formData, handleChange }) => {
    return (
        <div>
            <h1 className="text-2xl font-bold mb-4">What's your name?</h1>
            <form>
                <div className="mb-4">
                    <label htmlFor="first_name" className="block text-gray-700 text-sm font-bold mb-2">First Name</label>
                    <input type="text" id="first_name" name="first_name" value={formData.first_name} onChange={handleChange} required className="shadow appearance-none border rounded w-full py-2 px-3 bg-white text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-primary"/>
                </div>
                <div className="mb-4">
                    <label htmlFor="last_name" className="block text-gray-700 text-sm font-bold mb-2">Last Name</label>
                    <input type="text" id="last_name" name="last_name" value={formData.last_name} onChange={handleChange} required className="shadow appearance-none border rounded w-full py-2 px-3 bg-white text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-primary"/>
                </div>
            </form>
        </div>
    )
}

const EmailPasswordPrompt: React.FC<PromptProps> = ({ formData, handleChange }) => {
    return (
        <div>
            <h1 className="text-2xl font-bold mb-4">Let's create your account!</h1>
            <form>
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

interface Member {
    first_name: string;
    last_name: string;
    email: string;
    organization: string;
    role: string;
    status: string;
    user_name: string;
}

interface Organization {
    name: string;
}

interface ResponseData {
    organization: Organization;
    member: Member;
}

export default function CreateOrganization() {
    const [formData, setFormData] = useState<FormData>({
        first_name: '',
        last_name: '',
        email: '',
        password: '',
        name: ''
    });

    const [organizationName, setOrganizationName] = useState<string>("");
    const [userName, setUserName] = useState<string>("");
    const [error, setError] = useState<string>("");
    const [status, setStatus] = useState<string>("");
    const [step, setStep] = useState<number>(1);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({ ...prevData, [name]: value }));
    };

    const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement>) => {
        console.log(formData);

        try {
            const response = await axios.post(`${import.meta.env.VITE_BACKEND_ADDRESS}/org/organization/`, formData);
            console.log(response.data.data);
            setUserName(response.data.data.member.user_name);
            setOrganizationName(response.data.data.organization.name);
            setStatus('success');
            setFormData({
                first_name: '',
                last_name: '',
                email: '',
                password: '',
                name: ''
            });
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || 'An unknown error occurred';
            const errorDetails = error.response?.data?.data ? JSON.stringify(error.response.data.data) : '';
            setError(`${errorMessage}\n${errorDetails}`);
            console.log(`${errorMessage}\n${errorDetails}`)
            setStatus('error');
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="bg-tertiary p-8 rounded-lg shadow-md w-full max-w-md">
                <div className="w-60 h-60 rounded-full mx-auto mb-4 overflow-hidden">
                    <img src="/logo.png" alt="Scribo.AI Logo" className="w-full h-full object-cover" />
                </div>
                <h2 className="text-3xl font-bold mb-6 text-center">Create an Organization!</h2>
                {status === '' && (
                    <div>
                        {step === 1 && <OrganizationPrompt formData={formData} handleChange={handleChange} />}
                        {step === 2 && <NamePrompt formData={formData} handleChange={handleChange} />}
                        {step === 3 && <EmailPasswordPrompt formData={formData} handleChange={handleChange} />}
                        <div className="flex justify-between mt-4">
                            {step > 1 && (
                                <button onClick={() => setStep(step - 1)} className="bg-gray-300 text-gray-700 py-2 px-4 rounded">Back</button>
                            )}
                            {step < 3 && (
                                <button onClick={() => setStep(step + 1)} className="bg-button-primary-bg hover:bg-button-hover text-button-primary-txt py-2 px-4 rounded">Next</button>
                            )}
                            {step === 3 && (
                                <button
                                    className="bg-button-primary-bg hover:bg-button-hover text-button-primary-txt font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                                    onClick={handleSubmit}
                                    type="button"
                                >
                                    Submit
                                </button>
                            )}
                        </div>
                    </div>
                )}

                {status === 'success' && (
                    <div id="success-message" className="mt-6 space-y-3 text-green-950 w-full max-w-lg text-center">
                        <p>{organizationName} created successfully!</p>
                        <p>You can now sign in using the username <strong>{userName}</strong></p>

                        {/* Hidden autofill-friendly form */}
                        <form>
                            <input type="text" name="username" autoComplete="username" value={userName} readOnly hidden />
                            <input type="password" name="new-password" autoComplete="new-password" value={formData.password} readOnly hidden />
                        </form>

                        <Link
                            to="/login"
                            className="block w-3/4 mx-auto bg-button-primary-bg text-button-primary-txt py-3 rounded-lg text-lg font-semibold hover:bg-button-hover"
                        >
                            Log in now!
                        </Link>
                    </div>
                )}

                {status === 'error' && (
                    <div id="error-message" className="mt-4 text-red-600">
                        <p>{error}</p>
                    </div>
                )}
            </div>
        </div>
    );
}
