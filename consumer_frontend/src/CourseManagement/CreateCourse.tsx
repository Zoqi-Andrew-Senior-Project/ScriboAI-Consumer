import React, { useEffect, useState } from 'react';
import { useAuth } from '../utils/AuthContext';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FiEye, FiEdit2, FiTrash2, FiPlus } from 'react-icons/fi';
import { confirmAlert } from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

enum FeatureType {
  IMAGE = "image",
  INTER = "interactive",
  VIDEO = "video"
}

interface Module {
  uuid: string;
  name: string;
  duration: string;
  subtopics: string[];
  features: FeatureType[];
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
  updated_at?: string;
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
        toast.error('Failed to load courses');
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  const handleDelete = async (outline: Outline) => {
    confirmAlert({
      title: 'Confirm Deletion',
      message: `Are you sure you want to delete "${outline.title}"?`,
      buttons: [
        {
          label: 'Yes',
          onClick: async () => {
            try {
              await axios.delete(`${import.meta.env.VITE_BACKEND_ADDRESS}/course/course`, {
                data: { course: outline.uuid },
                withCredentials: true,
              });
              setCourses(courses.filter((course) => course.uuid !== outline.uuid));
              toast.success('Course deleted successfully');
            } catch (err) {
              console.error("Error deleting course:", err);
              toast.error('Failed to delete course');
            }
          }
        },
        {
          label: 'No',
          onClick: () => {}
        }
      ]
    });
  };

  const handleEdit = (outline: Outline) => {
    navigate(`/edit/outline/${outline.uuid}`);
  };

  const handleView = (outline: Outline) => {
    navigate(`/view/outline/${outline.uuid}`);
  };

  const handleCreate = () => {
    navigate('/create/outline');
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton height={40} count={5} />
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
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-6 border-b border-gray-200 flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-gray-800">Course Dashboard</h2>
        <button
          onClick={handleCreate}
          className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
        >
          <FiPlus className="mr-2" />
          Create New Course
        </button>
      </div>
      
      {courses.length === 0 ? (
        <div className="p-8 text-center text-gray-500">
          No courses found. Create your first course to get started.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Updated</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {courses.map((course) => (
                <tr key={course.uuid} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{course.title}</div>
                    <div className="text-sm text-gray-500">{course.modules.length} modules</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {course.duration}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColors[course.status.toLowerCase()] || 'bg-gray-100 text-gray-800'}`}>
                      {course.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {course.updated_at ? new Date(course.updated_at).toLocaleDateString() : 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => handleView(course)}
                        className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                        title="View"
                      >
                        <FiEye size={18} />
                      </button>
                      <button
                        onClick={() => handleEdit(course)}
                        className="text-yellow-600 hover:text-yellow-900 p-1 rounded hover:bg-yellow-50"
                        title="Edit"
                      >
                        <FiEdit2 size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(course)}
                        className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                        title="Delete"
                      >
                        <FiTrash2 size={18} />
                      </button>
                    </div>
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

const CourseDashboard = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="w-full max-w-4xl px-4 py-6">
          <Skeleton height={40} count={10} />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center p-6 max-w-md bg-white rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Please log in</h2>
          <p className="mb-4 text-gray-600">You need to be logged in to access this page.</p>
          <button
            onClick={() => window.location.href = '/login'}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  if (user.role !== 'OW' && user.role !== 'AD') {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center p-6 max-w-md bg-white rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Permission Denied</h2>
          <p className="mb-4 text-gray-600">You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <CourseTable />
      </div>
    </div>
  );
};

export default CourseDashboard;