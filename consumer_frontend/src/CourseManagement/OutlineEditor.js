import { useEffect, useState, useRef, useCallback } from "react";
import debounce from "lodash.debounce";
import { useParams } from "react-router-dom";
import '../courseoutline.css'
import isEqual from 'lodash/isEqual'; 

const EditableLine = ({ text, onSave, type = "text" }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [newText, setNewText] = useState(text);

    useEffect(() => {
      // Update newText when the text prop changes
      setNewText(text);
    }, [text]);

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
                  <span>{newText || "No data available."}</span>
              )}
        </div>
    );
};
    
const Feature = ({ feature }) => <li>{feature}</li>

const Module = ({ module, updateModule}) => {
    const handleSubtopicChange = (index, newText) => {
        const updatedSubtopics = [...module.subtopics]
        updatedSubtopics[index] = newText
        updateModule({ ...module, subtopics: updatedSubtopics })
    }

    return (
        <div className="module">
            <h4>Title:
                <EditableLine 
                    text={module.name} 
                    onSave={(newName) =>
                    updateModule({ ...module, name: newName })
                    }
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

const OutlineEditor = () => {
  const { outId } = useParams();

  const [outlineData, setOutlineData] = useState({}); // Local state for smooth typing

  const prevOutlineDataRef = useRef({});
  /* Script JSON
  {
    "title": str,
    "objectives": [str],
    "duration": string,
    "modules": [
      {
        "name": str,
        "duration" str,
        "subtopics": [str],
        "features": [str],
      },
      ...
    ],
    "summary": str
  }
  */

  const updateModule = (index, updatedModule) => {
    const updatedModules = [...outlineData.modules]
    updatedModules[index] = updatedModule
    setOutlineData({ ...outlineData, modules: updatedModules })
  }

  const ws = useRef(null);
  const isTyping = useRef(false); // Track typing activity

  useEffect(() => {
    ws.current = new WebSocket(`ws://localhost:8000/ws/outline/${outId}/`);

    ws.current.onopen = () => console.log("WebSocket Connected");

    ws.current.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        const script = data.data.script;
        if (!isTyping.current) {
          setOutlineData(script);
        }
      } catch (error) {
        console.error("Error parsing WebSocket message:", error);
      }
    };

    ws.current.onerror = (error) => console.error("WebSocket Error:", error);
    ws.current.onclose = () => console.log("WebSocket Disconnected");

    return () => ws.current?.close();
  }, [outId]);

  // Debounced function to send updates with batching
  const sendUpdate = useCallback(
    debounce((newOutlineData) => {
      console.log("WebSocket Update:", {"data": newOutlineData});
      const data = {
        "script": newOutlineData,
      }
      if (ws.current?.readyState === WebSocket.OPEN) {
        ws.current.send(JSON.stringify({"data": data}));
      }
      isTyping.current = false;
    }, 500), // Delay WebSocket updates by 500ms
    []
  );

  useEffect(() => {
    if (!isEqual(outlineData, prevOutlineDataRef.current)) {
      sendUpdate(outlineData);
      prevOutlineDataRef.current = outlineData;
    }
  }, [outlineData, sendUpdate]);

  const handleChange = ( updatedOutline ) => {
    setOutlineData(updatedOutline);
  }

  const debouncedSave = useCallback(
    debounce((outline) => {
      console.log("WebSocket Save:", {"data": outline});
      const data = {
        "action": "save",
        "data": {
          "script": outline,
        }
      };
      console.log("sending", data)
      if (ws.current?.readyState === WebSocket.OPEN) {
        ws.current.send(JSON.stringify(data));
      }
    }, 500), // Delay WebSocket save by 500ms
    []
  );

  const sendSave = () => {
    debouncedSave(outlineData);
  };

  return (
    <div class="course-outline" id="course outline">
      <button onClick={sendSave}>SAVE</button>
      <h1>Title:
        <EditableLine 
          text={outlineData.title} 
          onSave={(newTitle) => {
            const updatedOutline = { ...outlineData, title: newTitle };
            setOutlineData(updatedOutline);
          }}
        />
      </h1>

      <h4>Duration:</h4>
      <p>{outlineData.duration || "No duration specified"}</p>

      <h3>Summary:</h3>
      <EditableLine 
          text={outlineData.summary} 
          onSave={(newSummary) => {
            const updatedOutline = { ...outlineData, summary: newSummary};
            setOutlineData(updatedOutline);
          }} 
          type="textbox"
      />

      <h3>Objectives:</h3>
      <ul>
          {outlineData.objectives?.length > 0 ? (
            outlineData.objectives.map((objective, index) => (
              <li key={index}>
                <EditableLine 
                        text={objective} 
                        onSave={
                            (newObjective) => {
                                const updatedObjectives = [...outlineData.objectives]
                                updatedObjectives[index] = newObjective
                                setOutlineData({ ...outlineData, objectives: updatedObjectives })
                            }
                        }
                    />
              </li>
            ))
          ) : (
            <li>No objectives specified</li>
          )}
      </ul>

      <h3>Modules:</h3>
      {outlineData.modules?.length > 0 ? (
        outlineData.modules.map((module, index) => (
          <Module
            key={index}
            module={module}
            updateModule={(updatedModule) => updateModule(index, updatedModule)}
          />
        ))
      ) : (
        <p>No modules available</p>
      )}
      <h4>Raw JSON</h4>
      <p>{JSON.stringify(outlineData, null, 2)}</p>
      {/* <button onClick={console.log(outlineData)}>Hello</button> */}
    </div>
  );
};

export default OutlineEditor;