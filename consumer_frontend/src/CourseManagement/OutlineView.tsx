import { useParams } from "react-router-dom";
import { fetchCourseDetails, Course } from "@/api/course";
import { useEffect, useState } from "react";
import { HiClock, HiListBullet, HiFlag } from "react-icons/hi2";
import { FaSpinner } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { HiPencil, HiTrash } from "react-icons/hi";
import { useAuth } from "@/utils/AuthContext";

const OutlineView: React.FC = () => {
    const navigate = useNavigate(); // Add this hook
    const { corId } = useParams<{ corId: string }>();
    const [courseDetails, setCourseDetails] = useState<Course | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const { user } = useAuth();

    const handleDeleteCourse = () => {
        // Implement delete logic here
        console.log(`Deleting course ${corId}`);
        // Add confirmation modal and actual delete API call
    };
    
    useEffect(() => {
        const loadCourseDetails = async () => {
            if (!corId) {
                setError("No course ID provided");
                setIsLoading(false);
                return;
            }

            try {
                setIsLoading(true);
                const data = await fetchCourseDetails(corId);
                setCourseDetails(data);
            } catch (err) {
                console.error('Failed to load course details:', err);
                setError("Failed to load course details. Please try again later.");
            } finally {
                setIsLoading(false);
            }
        };
    
        loadCourseDetails();
    }, [corId]);

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <FaSpinner className="animate-spin text-blue-500 text-4xl" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mx-auto p-6">
                <div className="bg-red-50 border-l-4 border-red-500 p-4">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <p className="text-sm text-red-700">{error}</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!courseDetails) {
        return (
            <div className="container mx-auto p-6">
                <p className="text-gray-600">No course details found.</p>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-6 pb-20">
            {/* Header */}
            <h1 className="sr-only">Course Outline: {courseDetails.title}</h1>
            
            <div className="max-w-4xl mx-auto mb-8 bg-white rounded-xl shadow-md overflow-hidden transition-all hover:shadow-lg">
                <div className="p-8">
                    <div className="flex justify-between items-start">
                        <div>
                            <h2 className="text-3xl font-bold text-gray-900 mb-2">{courseDetails.title}</h2>
                            <p className="text-gray-600 mb-6">{courseDetails.summary}</p>
                        </div>
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                            {courseDetails.status}
                        </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                        <div className="flex items-start">
                            <HiClock className="h-6 w-6 text-blue-500 mr-2 mt-1" aria-hidden="true" />
                            <div>
                                <h3 className="text-lg font-semibold text-gray-800">Duration</h3>
                                <p className="text-gray-600">{courseDetails.duration}</p>
                            </div>
                        </div>

                        <div className="flex items-start">
                            <HiListBullet className="h-6 w-6 text-blue-500 mr-2 mt-1" aria-hidden="true" />
                            <div>
                                <h3 className="text-lg font-semibold text-gray-800">Modules</h3>
                                <p className="text-gray-600">{courseDetails.modules.length} modules</p>
                            </div>
                        </div>

                        <div className="flex items-start">
                            <HiFlag className="h-6 w-6 text-blue-500 mr-2 mt-1" aria-hidden="true" />
                            <div>
                                <h3 className="text-lg font-semibold text-gray-800">Organization</h3>
                                <p className="text-gray-600">{courseDetails.organization}</p>
                            </div>
                        </div>
                    </div>

                    <div className="mt-8">
                        <h2 className="text-xl font-semibold text-gray-800 mb-3">Learning Objectives</h2>
                        <ul className="space-y-2">
                            {courseDetails.objectives.map((objective, index) => (
                                <li key={index} className="flex items-start">
                                    <svg className="h-5 w-5 text-green-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    <span className="text-gray-700">{objective}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="mt-8">
                        <h2 className="text-xl font-semibold text-gray-800 mb-3">Course Modules</h2>
                        <div className="space-y-4">
                            {courseDetails.modules.map((module) => (
                                <div 
                                    key={module.uuid} 
                                    className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors duration-200"
                                >
                                    <h3 className="text-lg font-medium text-gray-900">{module.name}</h3>
                                    <p className="text-gray-600 text-sm mt-1">{module.duration}</p>
                                    
                                    <div className="mt-3 flex flex-wrap gap-2">
                                        {module.features.map((feature, i) => (
                                            <span 
                                                key={i} 
                                                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                                            >
                                                {feature}
                                            </span>
                                        ))}
                                    </div>

                                    <div className="mt-3">
                                        <h4 className="text-sm font-medium text-gray-700 mb-1">Topics covered:</h4>
                                        <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                                            {module.subtopics.map((topic, i) => (
                                                <li key={i}>{topic}</li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Action Buttons based on Role */}
            <div className="fixed bottom-6 right-6 flex flex-col space-y-3 items-end">
                {/* Start Course Button (visible to all) */}
                <button
                    onClick={() => navigate(`/view/page/${corId}`)}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-full shadow-lg transition-all duration-200 transform hover:scale-105 flex items-center"
                >
                    Start Course
                    <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                </button>

                {/* Admin/Owner Buttons - now checking actual user role from context */}
                {(user?.role === "AD" || user?.role === "OW") && (
                    <button
                        onClick={() => navigate(`/edit/outline/${corId}`)}
                        className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-3 px-6 rounded-full shadow-lg transition-all duration-200 transform hover:scale-105 flex items-center"
                    >
                        Edit Course
                        <HiPencil className="ml-2 w-5 h-5" />
                    </button>
                )}
            </div>
        </div>
    );
}

export default OutlineView;