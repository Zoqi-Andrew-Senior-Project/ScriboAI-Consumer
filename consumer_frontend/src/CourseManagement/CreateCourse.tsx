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
    <div className="flex items-center justify-center min-h-screen">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-4xl p-4">
        <div>
            <div className="w-24 h-24 rounded-full mx-auto mb-4 overflow-hidden">
              <img src="/logo.png" alt="Scribo.AI Logo" className="w-full h-full object-cover" />
            </div>
            <h2 className="text-3xl font-bold mb-6 text-center">Provide Information for Scribo</h2>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">Topic:</label>
            <input
              type="text"
              name="topic"
              value={promptData.topic}
              onChange={handleChange}
              placeholder="Enter Topic"
              className="shadow appearance-none border rounded w-full py-2 px-3 bg-white text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-primary"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">Duration:</label>
            <div className="">
              <input
                type="radio"
                name="duration"
                value="short"
                checked={promptData.duration === "short"}
                onChange={handleChange}
                className="h-5 w-5 text-primary focus:ring-primary"
              />
              <label className="ml-2 text-base font-light">Short (up to 1 hour)</label>
            </div>
            <div className="">
              <input
                type="radio"
                name="duration"
                value="long"
                checked={promptData.duration === "long"}
                onChange={handleChange}
                className="h-5 w-5 text-primary focus:ring-primary"
              />
              <label className="ml-2 text-base font-light">Long (more than 1 hour)</label>
            </div>
          </div>
          <button
            className="bg-button-primary-bg hover:bg-button-hover text-button-primary-txt font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full"
            onClick={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? 'Submitting...' : 'Submit'}
          </button>
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

      const url = `${import.meta.env.VITE_BACKEND_ADDRESS}/api/course/course/`
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
      {(
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
