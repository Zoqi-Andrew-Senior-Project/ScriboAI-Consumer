import React, { useState } from 'react';
import './App.css';
import axios from 'axios';
import CourseOutlineRenderer from './loadCourseOutline';
import CourseOutlineMenuRenderer from './courseOutlineMenu';

const PromptMenu = ({ courseData, handleChange, handleSubmit, isLoading }) => {
  return (
  <div className="container mt-5" id="initial form">
    <h2>Insert Relevant Information Here for Scribo</h2>
    <form onSubmit={handleSubmit}>
      <div>
        <label>
          Topic:
          <input
            type="text"
            name="topic"
            value={courseData.topic}
            onChange={handleChange}
            placeholder="Enter Topic"
            required
          />
        </label>
      </div>
      <div>
        <label>
          Duration:
          <div>
            <label>
              <input
                type="radio"
                name="duration"
                value="short"
                checked={courseData.duration === "short"}
                onChange={handleChange}
              />
              Short (up to 1 hour)
            </label>
          </div>
          <div>
            <label>
              <input
                type="radio"
                name="duration"
                value="long"
                checked={courseData.duration === "long"}
                onChange={handleChange}
              />
              Long (more than 1 hour)
            </label>
          </div>
        </label>
      </div>
      <button
        className="submit-btn mt-4"
        onClick={handleSubmit}
        disabled={isLoading} // Disable the button while loading
      >
        Submit
      </button>
    </form>
  </div>
  )
}

function CreateCourse() {
  const [isLoading, setIsLoading] = useState(false);
  const [courseData, setCourseData] = useState({
    topic: "",
    duration: "short",
  });
  const [courseOutlineData, setCourseOutlineData] = useState(null);
  const [responseContent, setResponseContent] = useState(null);

  const handleChange = (e) => {
      const { name, value } = e.target;
      setCourseData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleRefresh = () => {
    // Trigger a refresh by updating the courseOutlineData (re-fetch or reset)
    setCourseData(courseOutlineData)
  };

  const handleSubmit = async () => {
      setIsLoading(true);

      const url = "https://martinezjandrew-trainingcoursegen.hf.space/generate-outline"
      const time = courseData.duration === "short" ? "up to one hour" : "between one and two hours"
      const data = {
        topic: courseData.topic,
        time: time
      }
      try {
          const response = await axios.post(url, data);
          console.log(response);
          alert(`Course created successfully! ${courseData.topic} ${courseData.duration}`);

          setResponseContent(response.data);
          setCourseOutlineData(JSON.parse(response.data.response.output_validator.valid_replies))

          //setCourseData({ title: '', description: '' }); // Reset form
      } catch (error) {
          console.error("Error creating course:", error);
          alert("There was an error creating the course.");
      } finally {
          
          setIsLoading(false);
      }
  };

  const handleReset = () => {
    setCourseData({
      topic: "",
      duration: "short",
    });
    setResponseContent(null);  // Hide the response content
  };

  return (
    <div id="page">
      {!responseContent && (
        <PromptMenu
          courseData={courseData}
          handleChange={handleChange}
          handleSubmit={handleSubmit}
          isLoading={isLoading}
        />
      )}
      
      
      <div className="response-container mt-5">
        {responseContent ? (
          <>
            <CourseOutlineMenuRenderer 
              //data={JSON.parse(responseContent.response.output_validator.valid_replies)} 
              data={courseOutlineData}
              handleReset={handleReset}
              responseContent={responseContent}
              setResponseContent={setResponseContent}
              setCourseOutlineData={setCourseOutlineData}
              handleRefresh={handleRefresh}
            />
            <CourseOutlineRenderer 
              data={JSON.parse(responseContent.response.output_validator.valid_replies)}
              editable={true}
              courseOutlineData={courseOutlineData}
              setCourseOutlineData={setCourseOutlineData}
            />
          </>
        ): (
          <p></p>
        )}
      </div>

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
