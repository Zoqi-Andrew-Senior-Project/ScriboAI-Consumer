import React from 'react';
import './App.css';

function CreateCourse() {
  return (
    <div className="container mt-5">
        <h2>Insert Relevant Information Here for Scribo</h2>
        <textarea className="form-control mt-3" rows="15" placeholder="Enter course information..."></textarea>
    </div>
  );
}

export default CreateCourse;
