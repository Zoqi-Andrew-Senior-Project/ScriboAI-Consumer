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
        <div className="container-fluid main-content">
            <h1>Complete Course</h1>
            <button onClick={onPublish}>Publish</button>
            <button onClick={onDraft}>Save as a Draft</button>
            <p>{courseId}</p>
            <p>{course.title}</p>
        </div>
    );
  }

export default CourseDashboard;