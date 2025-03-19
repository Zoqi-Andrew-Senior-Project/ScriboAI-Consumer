import React, { useState } from 'react';
import '../App.css';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';


const PromptMenu = ({ promptData, handleChange, handleSubmit, isLoading }) => {
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
            value={promptData.topic}
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
                checked={promptData.duration === "short"}
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
                checked={promptData.duration === "long"}
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
  const [promptData, setPromptData] = useState({
    topic: "",
    duration: "short",
  });

  const [responseContent, setResponseContent] = useState({});

  const navigate = useNavigate();

  const handleChange = (e) => {
      const { name, value } = e.target;
      setPromptData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleSubmit = async () => {
      setIsLoading(true);

      const url = process.env.REACT_APP_BACKEND_ADDRESS + "/api/course/create-outline/"
      console.log(url)
      const time = promptData.duration === "short" ? "up to one hour" : "between one and two hours"
      const data = {
        topic: promptData.topic,
        time: time
      }
      try {
          const response = await axios.post(url, data);
          console.log(response);
          alert(`Course created successfully! ${promptData.topic} ${promptData.duration}`);

          navigate("/outline/" + response.data.uuid)

          setResponseContent(response.data);

      } catch (error) {
          console.error("Error creating course:", error);
          alert("There was an error creating the course.");
      } finally {
          
          setIsLoading(false);
      }
  };

  return (
    <div id="page">
      {!(responseContent == {}) && (
        <PromptMenu
          promptData={promptData}
          handleChange={handleChange}
          handleSubmit={handleSubmit}
          isLoading={isLoading}
        />
      )}
    </div>
  );
}

export default CreateCourse;
