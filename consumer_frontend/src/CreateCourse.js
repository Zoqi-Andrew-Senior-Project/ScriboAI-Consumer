import React, { useState } from 'react';
import './App.css';

function CreateCourse() {
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = () => {
    setIsLoading(true);

    // Simulate an API call with a delay
    setTimeout(() => {
      setIsLoading(false);
      alert("Course information submitted successfully!"); // This can be replaced with any other action after loading.
    }, 3000); // 3 seconds delay
  };

  return (
    <div className="container mt-5">
      <h2>Insert Relevant Information Here for Scribo</h2>
      <textarea
        className="form-control mt-3"
        rows="12"
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
