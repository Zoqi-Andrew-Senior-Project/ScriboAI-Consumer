import { useParams } from "react-router-dom";
import { fetchCourseDetails, Course } from "@/api/course";
import { useEffect, useState } from "react";
import { HiClock, HiListBullet, HiFlag } from "react-icons/hi2";
import { FaSpinner } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

interface MiniOutlineViewProps {
    corId: string; // Accept courseId as a prop
}

const MiniOutlineView: React.FC<MiniOutlineViewProps> = ({ corId }) => {
    const navigate = useNavigate();
    const [courseDetails, setCourseDetails] = useState<Course | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

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
            <div className="flex justify-center items-center h-32">
                <FaSpinner className="animate-spin text-blue-500 text-3xl" />
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
        <div className="max-w-sm mx-auto bg-white rounded-xl shadow-md p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">{courseDetails.title}</h2>
            <p className="text-gray-600 mb-4">{courseDetails.summary}</p>

            {/* Key Details */}
            <div className="flex items-center mb-4">
                <HiClock className="h-5 w-5 text-blue-500 mr-2" />
                <span className="text-gray-700">{courseDetails.duration}</span>
            </div>

            <div className="flex items-center mb-4">
                <HiListBullet className="h-5 w-5 text-blue-500 mr-2" />
                <span className="text-gray-700">{courseDetails.modules.length} modules</span>
            </div>

            <div className="flex items-center mb-4">
                <HiFlag className="h-5 w-5 text-blue-500 mr-2" />
                <span className="text-gray-700">{courseDetails.status}</span>
            </div>
        </div>
    );
};

export default MiniOutlineView;
