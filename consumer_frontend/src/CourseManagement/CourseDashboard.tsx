import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '../utils/AuthContext';
import axios from 'axios';
import '../App.css'
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
                data: {
                course: outline.uuid
                },
                withCredentials: true,  // Ensures cookies are sent
            })
            .then((response) => {
                console.log("Courses fetched successfully:", response.data);
                setCourses(response.data.courses);
            })
            .catch((error) => {
                console.error("Error fetching courses:", error);
            });
    }

    const onEdit = (outline: Outline) => {
        console.log("Editing outline", outline.uuid)
        navigate("/outline/" + outline.uuid)
    }

    const onView = (outline: Outline) => {
        console.log("Viewing outline", outline.uuid)
        
    };

    return (
        <div>
            <h2>Course List</h2>
            <table className="table">
                <thead>
                    <tr>
                        <th>Title</th>
                        <th>Duration</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {courses.map((course) => (
                        <tr key={course.uuid}>
                            <td>{course.title}</td>
                            <td>{course.duration}</td>
                            <td>{course.status}</td>
                            <td>
                                <button onClick={() => onView(course)} className="btn">👁️</button>
                                <button onClick={() => onEdit(course)} className="btn">🛠️</button>
                                <button onClick={() => onDelete(course)} className="btn">🗑️</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            {/* <MemberActionForm isOpen={isMemberActionFormOpen} onClose={handleCloseForm} member={selectedMember}/> */}
        </div>
    )
}

const CourseDashboard = () => {
    const { user, loading } = useAuth();

    if (loading) return <div>Loading...</div>;

    if (!user) return <div>Please log in.</div>;

    if (user.role !== 'OW' && user.role !== 'AD') return <div>Permission denied.</div>;

    return (        
        <div className="container-fluid main-content">
            <h1>Course Dashboard</h1>
            <div>
                <CourseTable />
            </div>
        </div>
    );
  }

export default CourseDashboard;