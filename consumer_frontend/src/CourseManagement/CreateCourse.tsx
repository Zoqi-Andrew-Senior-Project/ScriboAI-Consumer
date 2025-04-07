import React, { useState, ChangeEvent } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

interface PromptData {
  topic: string;
  duration: string;
}

interface PromptMenuProps {
  promptData: PromptData;
  handleChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  handleSubmit: (event: React.FormEvent<HTMLFormElement> | React.MouseEvent<HTMLButtonElement>) => void;
  isLoading: boolean;
}


const PromptMenu: React.FC<PromptMenuProps> = ({ promptData, handleChange, handleSubmit, isLoading }) => {
  return (
    <div className="flex items-center justify-center min-h-screen p-6">
      <div className="w-full max-w-4xl">
        <div className="flex flex-col items-center justify-center text-center mb-12">
          <div className="w-24 h-24 rounded-full mx-auto mb-6 overflow-hidden">
            <img src="/logo.png" alt="Scribo.AI Logo" className="w-full h-full object-cover shadow-lg" />
          </div>
          <h2 className="text-4xl font-bold mb-6 text-tertiary">Let's Build Your Course Outline!</h2>
          <p className="text-lg text-tertiary-light">Share a few details, and we'll generate a structured outline tailored to your topic and time constraints.</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-6 flex justify-center">
            <div className="w-full sm:w-2/3 md:w-1/2">
              <label htmlFor="topic" className="block text-tertiary text-sm font-bold mb-2">Topic:</label>
              <input
                type="text"
                id="topic"
                name="topic"
                value={promptData.topic}
                onChange={handleChange}
                placeholder="Enter the topic you want to create a course on"
                className="shadow appearance-none border rounded w-full py-3 px-4 bg-white text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-primary"
                required
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="mb-6 flex justify-center">
            <div className="w-full sm:w-2/3 md:w-1/2">
              <label className="block text-tertiary text-sm font-bold mb-2">Duration:</label>
              <div className="flex items-center mb-3">
                <input
                  type="radio"
                  id="short"
                  name="duration"
                  value="short"
                  checked={promptData.duration === "short"}
                  onChange={handleChange}
                  className="h-5 w-5 text-primary focus:ring-primary"
                  disabled={isLoading}
                />
                <label htmlFor="short" className="ml-2 text-tertiary font-light">Short (up to 1 hour)</label>
              </div>
              
              <div className="flex items-center">
                <input
                  type="radio"
                  id="long"
                  name="duration"
                  value="long"
                  checked={promptData.duration === "long"}
                  onChange={handleChange}
                  className="h-5 w-5 text-primary focus:ring-primary"
                  disabled={isLoading}
                />
                <label htmlFor="long" className="ml-2 text-tertiary font-light">Long (more than 1 hour)</label>
              </div>
            </div>
          </div>

          <div className="mb-6 flex justify-center">
            <div className="w-full sm:w-2/3 md:w-1/2">
              <button
                onClick={handleSubmit}
                className="bg-button-primary-bg hover:bg-button-hover text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:shadow-lg transition-transform hover:scale-105"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex justify-center items-center">
                    Submitting...
                  </span>
                ) : (
                  'Submit'
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
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

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;
      setPromptData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleSubmit = async () => {
      setIsLoading(true);

      const url = `${import.meta.env.VITE_BACKEND_ADDRESS}/course/course/`
      console.log(url)
      const time = promptData.duration === "short" ? "up to one hour" : "between one and two hours"
      const data = {
        topic: promptData.topic,
        time: time
      }
      try {
          const response = await axios.post(url, data, {
            withCredentials: true
        });
          console.log(response);
          alert(`Course created successfully! ${promptData.topic} ${promptData.duration}`);

          navigate("/edit/outline/" + response.data.uuid)

          setResponseContent(response.data);

      } catch (error) {
          console.error("Error creating course:", error);
          alert("There was an error creating the course.");
      } finally {
          
          setIsLoading(false);
      }
  };

  return (
    <div id="page" className='relative'>
      <PromptMenu
        promptData={promptData}
        handleChange={handleChange}
        handleSubmit={handleSubmit}
        isLoading={isLoading}
      />
      {isLoading && (
        <div className="absolute top-0 left-0 right-0 bottom-0 flex justify-center items-center z-50 bg-indigo-50/75">
          <div className="animate-pulse" style={{ width: "50px", height: "50px" }}>
            <img src="/minilogo.png" alt="logo" />
          </div>
        </div>
      )}
    </div>
  );
}

export default CreateCourse;
