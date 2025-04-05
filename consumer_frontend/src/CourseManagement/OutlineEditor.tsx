import { useEffect, useState, useRef, useCallback } from "react";
import debounce from "lodash.debounce";
import { useParams } from "react-router-dom";
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
        <div className="cursor-pointer" onDoubleClick={handleDoubleClick}>
          {isEditing ? (
                  type === "text" ? (
                      <input
                          type="text"
                          value={newText}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          onKeyDown={handleKeyDown}
                          autoFocus
                          className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                      />
                  ) : (
                      <textarea
                          value={newText}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          onKeyDown={handleKeyDown}
                          autoFocus
                          rows={4}
                          className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                      />
                  )
              ) : (
                  <span className="text-gray-700">{newText || "No data available."}</span>
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
        <div className="bg-white shadow-lg rounded-lg p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-lg font-semibold">Module</h4>
            <button className="text-red-500 hover:text-red-700 text-xl">X</button>
          </div>

          
          <div className="mb-4">
            <h5 className="text-base font-medium">Title:</h5>
            <EditableLine 
              text={module.name} 
              onSave={(newName) =>
              updateModule({ ...module, name: newName })
              }
            />
          </div>

          <div className="mb-4">
            <h5 className="text-base font-medium">Duration:</h5>
            <p className="text-sm text-gray-700">{module.duration}</p>
          </div>

          <div className="mb-4">
            <h5 className="text-base font-medium">Subtopics:</h5>
            <ul className="list-disc pl-5">
              {module.subtopics.map((subtopic, index) => (
                <li key={index} className="mb-2">
                  <EditableLine 
                    text={subtopic} 
                    onSave={(newText) => handleSubtopicChange(index, newText)}
                  />
                </li>
              ))}
            </ul>
          </div>

          <div className="mb-4">
            <h5 className="text-base font-medium">Features:</h5>
            <ul className="list-disc pl-5">
              {module.features.map((feature, index) => (
                <Feature key={index} feature={feature} />
              ))}
            </ul>
          </div>
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
    <div className="fixed inset-0 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-lg">
        <div className="flex justify-between items-center mb-4">
          <h5 className="text-2xl font-semibold">Regenerate Course Outline</h5>
          <button
            type="button"
            className="text-gray-600 hover:text-gray-900"
            onClick={onCancel}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
        <p className="mb-4 text-gray-600">Enter notes for the model to follow as it regenerates the outline!</p>
        <textarea
          className="w-full p-3 border border-gray-300 rounded-md mb-4"
          value={notes}
          onChange={handleChange}
          rows={4}
          placeholder="Enter your notes here"
        ></textarea>
        <div className="flex justify-end space-x-4">
          <button
            className="bg-gray-300 text-gray-700 font-semibold py-2 px-4 rounded-md hover:bg-gray-400"
            onClick={onCancel}
          >
            Cancel
          </button>
          <button
            className="bg-blue-500 text-white font-semibold py-2 px-4 rounded-md hover:bg-blue-600"
            onClick={onRegenerateAction}
          >
            Submit
          </button>
        </div>
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
  const [regenerateDialogPressed, setRegenerateDialogPressed] = useState<boolean>(false);

  const onRegenerateClick = () => {
    setRegenerateDialogPressed(true);
  }

  return (
    <div className="p-6 rounded-lg shadow-lg">
      <h2 className="text-3xl font-bold mb-6 text-center">Course Outline Editor</h2>

      <div className="space-y-4 w-full max-w-xs">
        <div>
          <button
            className="w-full bg-button-primary-bg hover:bg-button-hover text-button-primary-txt font-bold py-2 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            onClick={onNewPrompt}
          >
            New
          </button>
        </div>

        <div>
          <button
            className="w-full bg-button-primary-bg hover:bg-button-hover text-button-primary-txt font-bold py-2 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            onClick={onRegenerateClick}
          >
            Regenerate
          </button>
        </div>

        <div>
          <button
            className="w-full bg-button-primary-bg hover:bg-button-hover text-button-primary-txt font-bold py-2 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            onClick={onAccept}
          >
            Accept
          </button>
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
  const [loading, setLoading] = useState<boolean>(false); // Loading state

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
    
    ws.current = new WebSocket(`${import.meta.env.VITE_WS_BACKEND}/outline/${outId}/`);
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
    navigate("/create-course")
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
    setLoading(true);

    const uuid = outlineData?.uuid

    if (uuid !== null) {      
      const data = {
        "course": uuid
      }

      const url = `${import.meta.env.VITE_BACKEND_ADDRESS}/course/pages/`

      try {
        const response: InitializePagesResponseData = await axios.post(url, data);
        navigate(`/document/${response.data.course}`);
        //navigate("/outline/" + response.data.uuid)

      } catch (error) {
        console.error("ERROR:", error)
      } finally {
        setLoading(false);
      }

    }

  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-6xl p-4">
        <div className="flex items-center justify-center md:col-span-1">
          <OutlineEditorMenu onNewPrompt={onNewPrompt} onRegenerate={onRegenerate} onAccept={onAccept} />
        </div>

        <div className="bg-tertiary p-8 rounded-lg shadow-md w-full md:col-span-2 h-screen overflow-y-auto">
          
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-xl font-semibold text-gray-700">Course Outline</h1>
            <button 
              onClick={sendSave} 
              className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              SAVE
            </button>
          </div>

          <div className="mb-4">
            <h1 className="block text-gray-700 text-lg font-bold mb-2">Title:</h1>
            <EditableLine 
              text={outlineData?.title ?? "No data."} 
              onSave={(newTitle) => {
                setOutlineData((prev) => prev ? { ...prev, title: newTitle } : prev);
              }}
            />
          </div>
          
          <div className="mb-4">
            <h4 className="block text-gray-700 text-lg font-bold mb-2">Duration:</h4>
            <p className="">{outlineData?.duration || "No duration specified"}</p>
          </div>

          <div className="mb-4">
            <h3 className="block text-gray-700 text-lg font-bold mb-2">Summary:</h3>
            <EditableLine 
                text={outlineData?.summary ?? "No data."} 
                onSave={(newSummary) => {
                  setOutlineData((prev) => prev ? { ...prev, summary: newSummary } : prev);
                }} 
                type="textbox"
            />
          </div>

          <div className="mb-4">
            <h3 className="block text-gray-700 text-lg font-bold mb-2">Objectives:</h3>
            <ul className="">
                {outlineData?.objectives && outlineData.objectives.length  > 0 ? (
                  outlineData.objectives.map((objective, index) => (
                    <li key={index} className="">
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
          </div>

          <div className="mb-4">
            <h3 className="block text-gray-700 text-lg font-bold mb-2">Modules:</h3>
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
          </div>

          <div className="mb-4">
            {/* Add Module Button */}
            <button 
              className="flex items-center justify-center w-full py-3 px-6 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition duration-200"
            >
              <span className="mr-2">+</span> {/* Plus sign */}
            </button>
          </div>

          {/* <div className="">
            <h4>View Raw JSON</h4>
            <pre className="bg-gray-100 p-4 rounded-md overflow-auto">{JSON.stringify(outlineData, null, 2)}</pre>
          </div> */}
        </div>
      </div>
      {loading && (
        <div className="fixed top-0 left-0 right-0 bottom-0 flex justify-center items-center z-50 bg-indigo-50/75">
          <div className="animate-pulse" style={{ width: "50px", height: "50px" }}>
            <img src="/minilogo.png" alt="logo" />
          </div>
        </div>
      )}
    </div>
  );
};

export default OutlineEditor;