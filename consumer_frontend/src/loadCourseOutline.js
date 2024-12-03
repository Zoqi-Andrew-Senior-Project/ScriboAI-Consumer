import React, { useState } from 'react'
import './courseoutline.css'

const EditableLine = ({ text, onSave, type = "text", editable = false }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [newText, setNewText] = useState(text);

    const handleDoubleClick = () => {
        if (editable) {
            setIsEditing(true);
        }
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
        {isEditing  && editable ? (
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

const Module = ({ module, updateModule, editable }) => {
    const handleSubtopicChange = (index, newText) => {
        const updatedSubtopics = [...module.subtopics]
        updatedSubtopics[index] = newText
        updateModule({ ...module, subtopics: updatedSubtopics })
    }

    return (
        <div className="module">
            <h4>Title: {" " }
                <EditableLine 
                    text={module.name} 
                    onSave={(newName) =>
                    updateModule({ ...module, name: newName })
                    }
                    editable={editable}
                />
            </h4>
            <h4>Duration: {module.duration}</h4>
            <ul>
                <h5>Subtopics:</h5>
                {module.subtopics.map((subtopic, index) => (
                    <li key={index}>
                        <EditableLine 
                            text={subtopic} 
                            onSave={(newText) =>
                                handleSubtopicChange(index, newText)
                            }
                            editable={editable}
                        />
                    </li>
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

const CourseOutlineRenderer = ({ editable = false, courseOutlineData, setCourseOutlineData }) => {
    const updateModule = (index, updatedModule) => {
        const updatedModules = [...courseOutlineData.modules]
        updatedModules[index] = updatedModule
        setCourseOutlineData({ ...courseOutlineData, modules: updatedModules })
    }
    
    return (
        <div class="course-outline" id="course outline">
            <h1>Title: {" "}
                <EditableLine 
                    text={courseOutlineData.title} 
                    onSave={(newTitle) => 
                        setCourseOutlineData({ ...courseOutlineData, title: newTitle})
                    }
                    editable={editable}
                />
            </h1>
            <h4>Duration: {courseOutlineData.duration}</h4>
            <h3>Summary:</h3>
            <EditableLine 
                text={courseOutlineData.summary} 
                onSave={(newSummary) => 
                    setCourseOutlineData({ ...courseOutlineData, summary: newSummary})
                } 
                type="textbox"
                editable={editable}
            />
            <h3>Objectives:</h3>
            <ul>
                {courseOutlineData.objectives.map((objective, index) => (
                <li key={index}>
                    <EditableLine 
                        text={objective} 
                        onSave={
                            (newObjective) => {
                                const updatedObjectives = [...courseOutlineData.objectives]
                                updatedObjectives[index] = newObjective
                                setCourseOutlineData({ ...courseOutlineData, objectives: updatedObjectives })
                            }
                        }
                        editable={editable}
                    />
                </li>
                ))}
            </ul>
            <div class="module-container">
                <h3>Modules:</h3>
                {courseOutlineData.modules.map((module, index) => (
                    <Module
                        key={index}
                        module={module}
                        updateModule={(updatedModule) => updateModule(index, updatedModule)}
                        editable={editable}
                    />
                ))}
            </div>
            <button onClick={console.log(courseOutlineData)}>Hello</button>
        </div>
    )
}

export default CourseOutlineRenderer