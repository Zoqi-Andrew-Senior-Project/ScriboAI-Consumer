import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '../utils/AuthContext';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

enum FeatureType {
    IMAGE = "image",
    INTER = "interactive",
    VIDEO = "video"
  }
  
interface Module {
    "uuid": string;
    "name": string,
    "duration": string,
    "subtopics": string[],
    "features": FeatureType[]
}

interface Outline {
    "uuid": string;
    "title": string;
    "objectives": string[];
    "duration": string;
    "summary": string;
    "modules": Module[],
    "status": string
}

const CourseTable = () => {
    const [courses, setCourses] = useState<Outline[]>([]);
    const [selectedCourse, setSelectedCourse] = useState<Outline | null>(null);
    const navigate = useNavigate();


    useEffect(() => {
        axios
          .get(`${import.meta.env.VITE_BACKEND_ADDRESS}/api/course/course`, {
            withCredentials: true,  // Ensures cookies are sent
          })
          .then((response) => setCourses(response.data.courses))
          .catch((error) => console.error("Error fetching courses:", error));
    }, []);

    const onDelete = (outline: Outline) => {
        console.log("Deleting outline", outline.uuid)

        axios
            .delete(`${import.meta.env.VITE_BACKEND_ADDRESS}/api/course/course`, {
                data: { course: outline.uuid },
                withCredentials: true,  // Ensures cookies are sent
            })
            .then(() => {
                console.log("Course deleted successfully");
                // Remove the deleted course from the local state
                setCourses(courses.filter((course) => course.uuid !== outline.uuid));
            })
            .catch((error) => {
                console.error("Error deleting course:", error);
            });
    }

    const onEdit = (outline: Outline) => {
        console.log("Editing outline", outline.uuid)
        navigate("/outline/" + outline.uuid)
    }

    const onView = (outline: Outline) => {
        console.log("Viewing outline", outline.uuid)
        navigate("/view/" + outline.uuid)
        
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
                                    className="bg-blue-500 text-white px-3 py-2 rounded-md mr-2 hover:bg-blue-600 focus:ring-2 focus:ring-blue-400 transition-all"
                                >
                                    👁️
                                </button>
                                <button
                                    onClick={() => onEdit(course)}
                                    className="bg-yellow-500 text-white px-3 py-2 rounded-md mr-2 hover:bg-yellow-600 focus:ring-2 focus:ring-yellow-400 transition-all"
                                >
                                    🛠️
                                </button>
                                <button
                                    onClick={() => onDelete(course)}
                                    className="bg-red-500 text-white px-3 py-2 rounded-md hover:bg-red-600 focus:ring-2 focus:ring-red-400 transition-all"
                                >
                                    🗑️
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}

const CourseDashboard = () => {
    const { user, loading } = useAuth();

    if (loading) return <div>Loading...</div>;

    if (!user) return <div>Please log in.</div>;

    if (user.role !== 'OW' && user.role !== 'AD') return <div>Permission denied.</div>;

    return (
        <div className="flex justify-center min-h-screen">
            <div className="w-full max-w-4xl px-4 py-6">
                <h1 className="text-3xl font-semibold text-center mb-6">Course Dashboard</h1>
                <CourseTable />
            </div>
        </div>
    );
  }

export default CourseDashboard;