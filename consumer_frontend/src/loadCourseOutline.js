import React, { useState } from 'react'
import './courseoutline.css'

const EditableLine = ({ text, onSave, type = "text" }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [newText, setNewText] = useState(text);

    const handleDoubleClick = () => {
        setIsEditing(true);
    };

    const handleBlur = () => {
        // If you want to save when the input loses focus, use this
        setIsEditing(false);
        onSave(newText);
    };

    const handleChange = (e) => {
        setNewText(e.target.value);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
        setIsEditing(false);  // Stop editing on Enter key
        onSave(newText);      // Call the save function
        }
    };

    return (
        <div className="editable-line" onDoubleClick={handleDoubleClick}>
        {isEditing ? (
                type === "text" ? (
                    <input
                        type="text"
                        value={newText}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        onKeyDown={handleKeyDown}
                        autoFocus
                    />
                ) : (
                    <textarea
                        value={newText}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        onKeyDown={handleKeyDown}
                        autoFocus
                    />
                )
            ) : (
                <span>{newText}</span>
            )}
        </div>
    );
};
    
const Feature = ({ feature }) => <li>{feature}</li>

const Module = ({ module, updateModule }) => {
    const handleSubtopicChange = (index, newText) => {
        const updatedSubtopics = [...module.subtopics]
        updatedSubtopics[index] = newText
        updateModule({ ...module, subtopics: updatedSubtopics })
    }

    return (
        <div className="module">
            <h4>Title:<EditableLine text={module.name} onSave={(newName) =>
                updateModule({ ...module, name: newName })
            }/></h4>
            <h4>Duration: {module.duration}</h4>
            <ul>
                <h5>Subtopics:</h5>
                {module.subtopics.map((subtopic, index) => (
                    <li key={index}><EditableLine text={subtopic} onSave={(newText) =>
                        handleSubtopicChange(index, newText)
                    }/></li>
                ))}
            </ul>
            <ul>
                <h5>Features:</h5>
                {module.features.map((feature, index) => (
                    <Feature key={index} feature={feature} />
                ))}
            </ul>
        </div>
    )
}

const CourseOutlineRenderer = ({ data }) => {
    const [courseData, setCourseData] = useState(data)

    const handleSave = (newData) => {
        console.log("data:", data);
        console.log("courseData:", courseData)
        // Logic to update the data.title can go here
    };

    const updateModule = (index, updatedModule) => {
        const updatedModules = [...courseData.modules]
        updatedModules[index] = updatedModule
        setCourseData({ ...courseData, modules: updatedModules })
    }
    
    return (
        <div class="course-outline" id="course outline">
            <h1>Title: <EditableLine text={data.title} onSave={(newTitle) => 
                setCourseData({ ...courseData, title: newTitle})
            }/></h1>
            <h4>Duration: {data.duration}</h4>
            <h3>Summary:</h3>
            <EditableLine text={data.summary} onSave={(newSummary) => 
                setCourseData({ ...courseData, summary: newSummary})
            } type="textbox"/>
            <h3>Objectives:</h3>
            <ul>
                {data.objectives.map((objective, index) => (
                <li key={index}><EditableLine text={objective} onSave={(newObjective) => {
                    const updatedObjectives = [...courseData.objectives]
                    updatedObjectives[index] = newObjective
                    setCourseData({ ...courseData, objectives: updatedObjectives })
                }
                }/></li>
                ))}
            </ul>
            <div class="module-container">
                <h3>Modules:</h3>
                {data.modules.map((module, index) => (
                    <Module
                        key={index}
                        module={module}
                        updateModule={(updatedModule) => updateModule(index, updatedModule)}
                    />
                ))}
            </div>
        </div>
    )
}

export default CourseOutlineRenderer