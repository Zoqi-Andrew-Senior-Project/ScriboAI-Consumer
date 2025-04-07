import React, { useEffect, useState } from 'react';
import { useAuth } from '../utils/AuthContext';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

interface Module {
    uuid: string;
    name: string;
    duration: string;
    subtopics: string[];
    features: string[];
}

interface Outline {
    uuid: string;
    title: string;
    objectives: string[];
    duration: string;
    summary: string;
    modules: Module[];
    status: string;
}

const CourseTable = () => {
    const [courses, setCourses] = useState<Outline[]>([]);
    const navigate = useNavigate();

    useEffect(() => {
        axios
            .get(`${import.meta.env.VITE_BACKEND_ADDRESS}/course/course`, {
                withCredentials: true, // Ensures cookies are sent
            })
            .then((response) => setCourses(response.data.courses))
            .catch((error) => console.error("Error fetching courses:", error));
    }, []);

    const onView = (outline: Outline) => {
        console.log("Viewing outline", outline.uuid);
        navigate("/view/outline/" + outline.uuid);
    };

    return (
        <div className="overflow-x-auto shadow-md rounded-lg bg-white p-6">
            <h2 className="text-2xl font-semibold mb-4">Course List</h2>
            <table className="table-auto w-full text-left">
                <thead className="bg-gray-100">
                    <tr>
                        <th className="px-4 py-2 font-semibold text-gray-700">Title</th>
                        <th className="px-4 py-2 font-semibold text-gray-700">Duration</th>
                        <th className="px-4 py-2 font-semibold text-gray-700">Status</th>
                        <th className="px-4 py-2 font-semibold text-gray-700">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {courses.map((course) => (
                        <tr key={course.uuid} className="border-b hover:bg-gray-50">
                            <td className="px-4 py-2">{course.title}</td>
                            <td className="px-4 py-2">{course.duration}</td>
                            <td className="px-4 py-2">{course.status}</td>
                            <td className="px-4 py-2">
                                <button
                                    onClick={() => onView(course)}
                                    className="bg-blue-500 text-white px-3 py-2 rounded-md hover:bg-blue-600 focus:ring-2 focus:ring-blue-400 transition-all"
                                >
                                    👁️ View
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

const EmployeeCourseDashboard = () => {
    const { user, loading } = useAuth();

    if (loading) return <div>Loading...</div>;

    if (!user) return <div>Please log in.</div>;

    return (
        <div className="flex justify-center min-h-screen">
            <div className="w-full max-w-4xl px-4 py-6">
                <h1 className="text-3xl font-semibold text-center mb-6">Employee Course Dashboard</h1>
                <CourseTable />
            </div>
        </div>
    );
};

export default EmployeeCourseDashboard;