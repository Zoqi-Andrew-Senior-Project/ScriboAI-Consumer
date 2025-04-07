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
          .get(`${import.meta.env.VITE_BACKEND_ADDRESS}/course/course`, {
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
            .put(`${import.meta.env.VITE_BACKEND_ADDRESS}/course/course/`, {
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
            .put(`${import.meta.env.VITE_BACKEND_ADDRESS}/course/course/`, {
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
    <div className="w-full mx-auto px-4 py-6 flex flex-col items-center space-y-6">
        <div className="max-w-2xl w-full px-8 py-12 bg-white rounded-xl shadow-lg border border-gray-100">
          {/* Celebration Header */}
          <div className="text-center mb-8">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
              <svg 
                className="h-10 w-10 text-green-600" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Course Completed!</h1>
            <p className="text-lg text-gray-600">
              Now decide: publish now for your organization or save as draft to continue later...
            </p>
          </div>
      
          {/* Course Card */}
          <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">{course.title}</h2>
            <div className="flex items-center text-gray-600 space-x-4 mb-3">
              <span className="flex items-center">
                <svg className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {course.duration}
              </span>
            </div>
            <p className="text-gray-700">{course.summary}</p>
          </div>
      
          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button
              onClick={onPublish}
              className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-8 py-4 rounded-lg hover:from-blue-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 shadow-md transition-all transform hover:scale-[1.02]"
            >
              <span className="font-semibold text-lg">Publish Now</span>
              <svg className="ml-2 h-5 w-5 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </button>
      
            <button
              onClick={onDraft}
              className="flex-1 bg-gradient-to-r from-gray-500 to-gray-600 text-white px-8 py-4 rounded-lg hover:from-gray-600 hover:to-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 shadow-md transition-all transform hover:scale-[1.02]"
            >
              <span className="font-semibold text-lg">Save as Draft</span>
              <svg className="ml-2 h-5 w-5 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    );
  }

export default CourseDashboard;