import { useParams } from "react-router-dom";
import { useAuth } from "../utils/AuthContext";
import { useEffect, useState } from "react";
import axios from "axios";
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
    "modules": Module[]
}

const CourseDashboard = () => {
    const { user, loading } = useAuth();
    const { courseId } = useParams();
    const [course, setCourse] = useState<Outline>([]);
    const navigate = useNavigate();

    if (loading) return <div>Loading...</div>;

    if (!user) return <div>Please log in.</div>;

    if (user.role !== 'OW' && user.role !== 'AD') return <div>Permission denied.</div>;    

    useEffect(() => {
        axios
          .get(`${import.meta.env.VITE_BACKEND_ADDRESS}/api/course/course`, {
            params: {
                course: courseId,
            },
            withCredentials: true,  // Ensures cookies are sent
          })
          .then((response) => setCourse(response.data.course))
          .catch((error) => console.error("Error fetching courses:", error));
    }, []);

    const onPublish = () => {
        console.log("Publishing outline", course.uuid)

        axios
            .put(`${import.meta.env.VITE_BACKEND_ADDRESS}/api/course/course/`, {
                action: "publish",
                course: course.uuid,
                withCredentials: true,  // Ensures cookies are sent
            })
            .then((response) => {
                console.log("Course Published Successfully:", response.data);
                navigate(`/course-dashboard`);
            })
            .catch((error) => {
                console.error("Error publishing course:", error);
            });
    }

    const onDraft = () => {
        console.log("Drating outline", course.uuid)

        axios
            .put(`${import.meta.env.VITE_BACKEND_ADDRESS}/api/course/course/`, {
                action: "draft",
                course: course.uuid,
                withCredentials: true,  // Ensures cookies are sent
            })
            .then((response) => {
                console.log("Success:", response.data);
                navigate(`/course-dashboard`);
            })
            .catch((error) => {
                console.error("Error publishing course:", error);
            });
    }

    return (        
        <div className="flex justify-center min-h-screen">
            <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
                <h1 className="text-3xl font-semibold text-center">Complete Course</h1>

                {/* Buttons with proper styling and spacing */}
                <div className="flex justify-between items-center space-x-4">
                    <button
                    onClick={onPublish}
                    className="bg-blue-500 text-white px-6 py-3 rounded-md hover:bg-blue-600 focus:ring-2 focus:ring-blue-400 transition-all"
                    >
                    Publish
                    </button>

                    <button
                    onClick={onDraft}
                    className="bg-gray-500 text-white px-6 py-3 rounded-md hover:bg-gray-600 focus:ring-2 focus:ring-gray-400 transition-all"
                    >
                    Save as a Draft
                    </button>
                </div>

                {/* Course Information */}
                <div className="space-y-2 text-center">
                    <p className="text-lg font-medium">{courseId}</p>
                    <p className="text-xl font-semibold text-gray-800">{course.title}</p>
                </div>
            </div>
        </div>
    );
  }

export default CourseDashboard;