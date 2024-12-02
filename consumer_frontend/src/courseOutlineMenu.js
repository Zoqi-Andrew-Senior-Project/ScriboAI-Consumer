import React, { useState } from 'react'
import './courseoutline.css'
import PromptMenu from './CreateCourse'

const CourseOutlineMenuRenderer = ({ data }) => {
    const [courseData, setCourseData] = useState(data)
    const [responseContent, setResponseContent] = useState(null);

    const onNewPrompt = () => {
        console.log("new prompt")
        console.log(courseData)

    }
    const onRegenerate = (newData) => {
        console.log("regenerate")
    }
    const onAccept = (newData) => {
        console.log("accept")
    }

    return (
        <div className="course-outline" id="outline menu">
            <div className="outline-menu">
                <h2>Course Outline Editor</h2>
                <div className="menu-buttons">
                    <button onClick={onNewPrompt}>New Prompt</button>
                    <button onClick={onRegenerate}>Regenerate</button>
                    <button onClick={onAccept}>Accept</button>
                </div>
            </div>
        </div>
    )
}

export default CourseOutlineMenuRenderer