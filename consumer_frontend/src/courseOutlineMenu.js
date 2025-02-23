import React, { useState } from 'react'
import './courseoutline.css'
import './App.css'
import PromptMenu from './CreateCourse'
import axios from 'axios';

const RegenerateDialog = ({ data, setRegenerateDialogPressed, setResponseContent, handleRefresh, setCourseOutlineData, responseContent }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [notes, setNotes] = useState("")

    const handleChange = (e) => {
        setNotes(e.target.value);
    };

    const onCancel = () => {
        setRegenerateDialogPressed(null)
    }

    const onSubmit = async () => {
        setIsLoading(true);

        const url = process.env.REACT_APP_HUGGINGFACE_ADDRESS + "/update-outline"

        const script = data
        const requestData = {
            notes,
            script
        }
        console.log("sending...")

        
        try {
            const response = await axios.post(url, requestData);
            console.log("response from submit: ",response);
            alert(`Course created successfully!`);
            setResponseContent(response.data);
            setCourseOutlineData(JSON.parse(response.data.response.output_validator.valid_replies))
        } catch (error) {
            console.error("Error creating course:", error);
            alert("There was an error creating the course.");
        } finally {
            setIsLoading(false);
            setRegenerateDialogPressed(null)
        }
    }

    return (
        <div className="course-outline" id="outline menu">
            <div className='outline-menu'>
                <p>Enter notes for the model to follow as it regenerates the outline!</p>
                <textarea 
                    value={notes} 
                    onChange={handleChange}
                ></textarea>
                <div className='menu-buttons'>
                    <div className='button-wrapper'>
                        <button className='btn-primary btn-group' onClick={onCancel}>Cancel</button>
                    </div>
                    <div className='button-wrapper'>
                        <button className='btn-primary btn-group' onClick={onSubmit}>Submit</button>
                    </div>
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
        </div>
    )
}
const CourseOutlineMenuRenderer = ({ data, handleReset, responseContent, setResponseContent, handleRefresh, setCourseOutlineData }) => {
    const [outlineData] = useState(data)
    const [regenerateDialogPressed, setRegenerateDialogPressed] = useState(null)
    const [hoveredButton, setHoveredButton] = useState(null)

    const handleMouseEnter = (buttonName) => {
        setHoveredButton(buttonName);
    };

    const handleMouseLeave = () => {
        setHoveredButton(null);
    };

    const onNewPrompt = () => {
        console.log("new prompt")
        handleReset()

    }
    const onRegenerate = () => {
        console.log("regenerate")
        setRegenerateDialogPressed("True")
    }
    const onAccept = () => {
        console.log("accept")
        console.log("courseoutline:", data)
        console.log("responsecontent:", responseContent)
    }

    return (
        <div>
            <div className="course-outline" id="outline menu">
                <div className="outline-menu">
                    <h2>Course Outline Editor</h2>
                    <div className="menu-buttons">
                        <div
                            className="button-wrapper"
                            onMouseEnter={() => handleMouseEnter('newPrompt')}
                            onMouseLeave={handleMouseLeave}
                        >
                            <button className="btn-primary btn-group" onClick={onNewPrompt}>Restart</button>
                            {hoveredButton === 'newPrompt' && (
                            <span className="tooltip">Reset the course and start fresh.</span>
                            )}
                        </div>
                        <div
                            className="button-wrapper"
                            onMouseEnter={() => handleMouseEnter('regenerate')}
                            onMouseLeave={handleMouseLeave}
                        >
                            <button className="btn-primary btn-group" onClick={onRegenerate}>Regenerate</button>
                            {hoveredButton === 'regenerate' && (
                            <span className="tooltip">Send the current course outline and notes to prompt for an entire new outline.</span>
                            )}
                        </div>
                        <div
                            className="button-wrapper"
                            onMouseEnter={() => handleMouseEnter('accept')}
                            onMouseLeave={handleMouseLeave}
                        >
                            <button className="btn-primary btn-group" onClick={onAccept}>Accept</button>
                            {hoveredButton === 'accept' && (
                            <span className="tooltip">Accept the current course outline and move onto script generation.</span>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            {regenerateDialogPressed && (
                <RegenerateDialog
                    data = {data}
                    setRegenerateDialogPressed = {setRegenerateDialogPressed}
                    setResponseContent = {setResponseContent}
                    handleRefresh = {handleRefresh}
                    setCourseOutlineData = {setCourseOutlineData}
                    responseContent = {responseContent}
                />
            )}
        </div>
    )
}

export default CourseOutlineMenuRenderer