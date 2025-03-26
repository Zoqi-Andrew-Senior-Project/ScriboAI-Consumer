import { useEffect, useState, useRef, useCallback } from "react";
import debounce from "lodash.debounce";
import { useParams } from "react-router-dom";
import './courseoutline.css'
import isEqual from "lodash/isEqual";
import axios from "axios";
import { useNavigate } from 'react-router-dom';

enum FeatureType {
  IMAGE = "image",
  INTER = "interactive",
  VIDEO = "video"
}

interface Module {
  "uuid": string;
  "name": string,
  "duration": string,
  "subtopics": string[],
  "features": FeatureType[]
}

interface Outline {
  "uuid": string;
  "title": string;
  "objectives": string[];
  "duration": string;
  "summary": string;
  "modules": Module[]
}

interface EditableLineProps {
  text: string;
  onSave: (newText: string) => void;
  type?: string;
}

const EditableLine: React.FC<EditableLineProps> = ({ text, onSave, type = "text" }) => {
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

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement> | React.ChangeEvent<HTMLInputElement>) => {
      setNewText(e.target.value);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement> | React.KeyboardEvent<HTMLTextAreaElement> ) => {
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
    
const Feature = ({ feature }: { feature: FeatureType }) => <li>{feature}</li>

const Module = ({ module, updateModule }: { module: Module; updateModule: (updatedModule: Module) => void }) => {
    const handleSubtopicChange = (index:number, newText:string) => {
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

interface RegenerateDialogProps {
  setRegenerateDialogPressed: React.Dispatch<React.SetStateAction<boolean>>;
  onRegenerate: (comments: string) => void;
}

const RegenerateDialog: React.FC<RegenerateDialogProps> = ({ setRegenerateDialogPressed, onRegenerate }) => {
  const [notes, setNotes] = useState("")

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement> | React.ChangeEvent<HTMLInputElement>) => {
    setNotes(e.target.value);
  };

  const onCancel = () => {
    setRegenerateDialogPressed(false)
  }

  const onRegenerateAction = () => {
    const comments = notes;
    setRegenerateDialogPressed(false)
    onRegenerate(comments);
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
                    <button className='btn-primary btn-group' onClick={onRegenerateAction}>Submit</button>
                </div>
            </div>
            {/* {isLoading && (
                <div className="spinner-container">
                <div className="spinner-border" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
                <p>Loading...</p>
                </div>
            )} */}
        </div>
    </div>
  )
}

interface OutlineEditorMenuProps {
  onRegenerate: (comments: string) => void;
  onNewPrompt: () => void;
  onAccept: () => void;
}

const OutlineEditorMenu: React.FC<OutlineEditorMenuProps>= ({ onNewPrompt, onRegenerate, onAccept }) => {
  const [hoveredButton, setHoveredButton] = useState<string | null>(null);
  const [regenerateDialogPressed, setRegenerateDialogPressed] = useState<boolean>(false);
  
  const handleMouseEnter = (buttonName: string) => {
    setHoveredButton(buttonName);
  };

  const handleMouseLeave = () => {
    setHoveredButton(null);
  };

  const onRegenerateClick = () => {
    setRegenerateDialogPressed(true);
  }
  return (
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
              <button className="btn-primary btn-group" onClick={onRegenerateClick}>Regenerate</button>
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
        {regenerateDialogPressed && (
                <RegenerateDialog 
                  setRegenerateDialogPressed={setRegenerateDialogPressed}
                  onRegenerate={onRegenerate}
                />
            )}
    </div>
  )
}

const OutlineEditor = () => {
  const { outId } = useParams();
  

  const [outlineData, setOutlineData] = useState<Outline | null>(null); // Local state for smooth typing
  const [prevOutlineData, setPreviousOutlineData] = useState<Outline | null>(null); // Local state for smooth typing

  // const prevOutlineDataRef = useRef<Outline | null>(null);

  
  const navigate = useNavigate();
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

  const updateModule = (index: number, updatedModule: Module) => {
    if (outlineData) {
      const updatedModules = [...outlineData.modules]
      updatedModules[index] = updatedModule
      setOutlineData({ ...outlineData, modules: updatedModules })
    }
  }

  const ws = useRef<WebSocket | null>(null);
  
  const isTyping = useRef(false); // Track typing activity

  useEffect(() => {
    if (ws.current) {
       ws.current.close(); // Close previous connection before reconnecting
    }
    
    ws.current = new WebSocket(`ws://localhost:8000/ws/outline/${outId}/`);

    ws.current.onopen = () => console.log("WebSocket Connected");

    ws.current.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        const script = data.data.script;
        console.log("Received WebSocket Data:", script);
        if (!isTyping.current) {
          setOutlineData(script);
          setPreviousOutlineData(script);
          console.log("Received A Message")
        }
      } catch (error) {
        console.error("Error parsing WebSocket message:", error);
      }
    };

    ws.current.onerror = (error) => console.error("WebSocket Error:", error);
    ws.current.onclose = () => console.log("WebSocket Disconnected");

    return () => ws.current?.close();
  }, [outId]);

  const detectChanges = ( prev: Outline | null, curr: Outline | null) => {
    console.log("prev\n", prev)
    console.log("curr\n", curr)
    console.log("detecting changes...")
    if (!prev || !curr) return curr;
    console.log("passed!")

    let changes: Partial<Outline & { moduleChanges?: { add?: Module[]; remove?: string[]; update?: Module[] } }> = {};
    
    if (prev && curr) {
      (["title", "summary", "duration"] as Array<keyof Pick<Outline, "title" | "summary" | "duration">>).forEach((field) => {
        if (prev[field] !== curr[field]) {
          changes[field] = curr[field]; // Now TypeScript understands the expected type
        }
      });
    }

    if (!isEqual(prev.objectives, curr.objectives)) {
      changes.objectives = curr.objectives;
    }

    const moduleChanges: {
      add?: Module[];
      remove?: string[];
      update?: Module[];
    } = {};

    const prevModules = prev.modules || [];
    const currModules = curr.modules || [];

    const prevModulesMap = new Map(prevModules.map(mod => [mod.uuid, mod]));

    currModules.forEach(mod => {
        if (!prevModulesMap.has(mod.uuid)) {
            // Module is newly added
            moduleChanges.add = moduleChanges.add || [];
            moduleChanges.add.push(mod);
        } else if (!isEqual(prevModulesMap.get(mod.uuid), mod)) {
            // Module has been updated
            moduleChanges.update = moduleChanges.update || [];
            moduleChanges.update.push(mod);
        }
    });

    prevModules.forEach(mod => {
        if (!currModules.find(m => m.uuid === mod.uuid)) {
            // Module has been removed
            moduleChanges.remove = moduleChanges.remove || [];
            moduleChanges.remove.push(mod.uuid);
        }
    });

    if (Object.keys(moduleChanges).length > 0) {
        changes.moduleChanges = moduleChanges;
    }

    return Object.keys(changes).length > 0 ? changes : null;
};

  // Debounced function to send updates with batching
  const sendUpdate = useCallback(
    debounce((oldOutlineData, newOutlineData) => {
      console.log("sending update...")
      const changes = detectChanges(oldOutlineData, newOutlineData);

      console.log(changes);

      if (!changes) return;

      // if (changes){
      //   console.log("WebSocket Update:", {"changes": changes});
      // }

      const data = { changes: changes };
      const action = "change"

      const message = {
        action: "change",
        data: data
      }

      console.log(message)

      if (ws.current?.readyState === WebSocket.OPEN) {
        ws.current.send(JSON.stringify({
          "action": action,
          "data": data
        }));
      }
      isTyping.current = false;
    }, 500), // Delay WebSocket updates by 500ms
    []
  );

  useEffect(() => {
    console.log("outlineData changed:", outlineData);
    console.log("previous:", prevOutlineData);
    console.log()
    if (!isEqual(outlineData, prevOutlineData)) {
      sendUpdate(prevOutlineData, outlineData);
    }
  }, [outlineData, sendUpdate]);

  const handleChange = ( updatedOutline: Outline ) => {
    console.log("handling change", updatedOutline)
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
    console.log(outlineData);
    debouncedSave(outlineData);
  };

  const onNewPrompt = () => {
    console.log("new prompt");
    // Send a message to the WebSocket server to handle the new prompt action
    // if (ws.current?.readyState === WebSocket.OPEN) {
    //   ws.current.send(JSON.stringify({ "action": "newPrompt" }));
    // }
  };

  const onRegenerate = (comments: string) => {
    // Send a message to the WebSocket server to handle the regenerate action
    const data = {
      "action": "update",
      "data": {
        "comments": comments,
        "script": outlineData
      }
    }

    console.log("regenerate")

    console.log(data)

    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify(data));
    }
  };

  interface PageData{
    prevPage: string,
    nextPage: string,
    currentPage: string,
    course: string,
    total: number,
    current_order: number,
    content: string,
  }

  interface InitializePagesResponseData{
    data: PageData
  }

  const onAccept = async () => {

    const uuid = outlineData?.uuid

    if (uuid !== null) {      
      const data = {
        "course": uuid
      }

      const url = `${import.meta.env.VITE_BACKEND_ADDRESS}/api/course/pages/`

      try {
        const response: InitializePagesResponseData = await axios.post(url, data);
        navigate(`/document/${response.data.course}`);
        //navigate("/outline/" + response.data.uuid)

      } catch (error) {
        console.error("ERROR:", error)
      }

    }

  };

  return (
    <div>
      <OutlineEditorMenu onNewPrompt={onNewPrompt} onRegenerate={onRegenerate} onAccept={onAccept} />
      <div className="course-outline" id="course outline">
        <button onClick={sendSave}>SAVE</button>
        <h1>Title:
          <EditableLine 
            text={outlineData?.title ?? "No data."} 
            onSave={(newTitle) => {
              setOutlineData((prev) => prev ? { ...prev, title: newTitle } : prev);
            }}
          />
        </h1>

        <h4>Duration:</h4>
        <p>{outlineData?.duration || "No duration specified"}</p>

        <h3>Summary:</h3>
        <EditableLine 
            text={outlineData?.summary ?? "No data."} 
            onSave={(newSummary) => {
              setOutlineData((prev) => prev ? { ...prev, summary: newSummary } : prev);
            }} 
            type="textbox"
        />

        <h3>Objectives:</h3>
        <ul>
            {outlineData?.objectives && outlineData.objectives.length  > 0 ? (
              outlineData.objectives.map((objective, index) => (
                <li key={index}>
                  <EditableLine 
                          text={objective}
                          onSave={(newObjective) => {
                            setOutlineData((prev) => {
                              if (!prev) return prev; // Prevents null errors
                              const updatedObjectives = [...prev.objectives];
                              updatedObjectives[index] = newObjective;
                              return { ...prev, objectives: updatedObjectives };
                            });
                          }}
                      />
                </li>
              ))
            ) : (
              <li>No objectives specified</li>
            )}
        </ul>

        <h3>Modules:</h3>
        {outlineData?.objectives && outlineData.modules?.length > 0 ? (
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
        <h4>Raw JSON Previous</h4>
        <p>{JSON.stringify(prevOutlineData, null, 2)}</p>
      </div>
    </div>
  );
};

export default OutlineEditor;