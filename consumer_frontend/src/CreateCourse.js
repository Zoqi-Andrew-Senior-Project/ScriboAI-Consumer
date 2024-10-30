import React, { useState } from 'react';
import './App.css';
import axios from 'axios';

function CreateCourse() {
  const [isLoading, setIsLoading] = useState(false);
    const [courseData, setCourseData] = useState({ title: '', description: '' });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setCourseData((prevData) => ({ ...prevData, [name]: value }));
    };

    const handleSubmit = async () => {
        setIsLoading(true);

        try {
            const response = await axios.post('http://137.184.77.182//api/courses/create/', courseData);
            alert("Course created successfully!");
            setCourseData({ title: '', description: '' }); // Reset form
        } catch (error) {
            console.error("Error creating course:", error);
            alert("There was an error creating the course.");
        } finally {
            setIsLoading(false);
        }
  };

  return (
    <div className="container mt-5">
      <h2>Insert Relevant Information Here for Scribo</h2>
      <textarea
        className="form-control mt-3"
        rows="10"
        placeholder="Enter course information..."
      ></textarea>

      <button
        className="submit-btn mt-4"
        onClick={handleSubmit}
        disabled={isLoading} // Disable the button while loading
      >
        Submit
      </button>

      {isLoading && (
        <div className="spinner-container">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p>Loading...</p>
        </div>
      )}
    </div>
  );
}

export default CreateCourse;
