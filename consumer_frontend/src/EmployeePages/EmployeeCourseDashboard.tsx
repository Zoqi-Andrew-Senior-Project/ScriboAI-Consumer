import React, { useEffect, useState } from 'react';
import { useAuth } from '../utils/AuthContext';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FiEye } from 'react-icons/fi';
import Tooltip from "@/components/Tooltip";

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
  created_at?: string;
}

const statusColors: Record<string, string> = {
  draft: 'bg-yellow-100 text-yellow-800',
  published: 'bg-green-100 text-green-800',
  archived: 'bg-gray-100 text-gray-800',
  in_review: 'bg-blue-100 text-blue-800',
};

const CourseTable = () => {
  const [courses, setCourses] = useState<Outline[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_BACKEND_ADDRESS}/course/course`, {
          withCredentials: true,
        });
        setCourses(response.data.courses);
      } catch (err) {
        console.error("Error fetching courses:", err);
        setError('Failed to load courses. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  const handleView = (outline: Outline) => {
    navigate(`/view/outline/${outline.uuid}`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-10">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-10">
        <div className="text-red-500 mb-4">{error}</div>
        <button 
          onClick={() => window.location.reload()}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="bg-tertiary rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-2xl font-semibold text-gray-800">Available Courses</h2>
        <p className="text-gray-600 mt-1">Browse and access all available training materials</p>
      </div>
      
      {courses.length === 0 ? (
        <div className="p-8 text-center text-gray-500">
          No courses available at the moment.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-tertiary-light/20">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Modules</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-tertiary-light/5 divide-y divide-gray-200">
              {courses.map((course) => (
                <tr key={course.uuid} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">{course.title}</div>
                    <div className="text-sm text-gray-500 line-clamp-1">{course.summary}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {course.duration}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {course.modules.length}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColors[course.status.toLowerCase()] || 'bg-gray-100 text-gray-800'}`}>
                      {course.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Tooltip label="View the course." aria-label="View the course.">
                        <button
                        onClick={() => handleView(course)}
                        className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50 flex items-center"
                        title="View Course"
                        >
                        <FiEye className="mr-1" size={18} />
                        View
                        </button>
                    </Tooltip>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

const EmployeeCourseDashboard = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-4">Please log in to access courses</h2>
          <button 
            onClick={() => navigate('/login')}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-center text-center mb-12">
            <div className="w-24 h-24 rounded-full mx-auto mb-6 overflow-hidden">
                <img src="/logo.png" alt="Scribo.AI Logo" className="w-full h-full object-cover shadow-lg" />
            </div>
            <h2 className="text-4xl font-bold mb-6 text-tertiary">Employee Training Portal</h2>
            <p className="text-lg text-tertiary-light">Access your training materials and courses.</p>
        </div>
        <CourseTable />
      </div>
    </div>
  );
};

export default EmployeeCourseDashboard;