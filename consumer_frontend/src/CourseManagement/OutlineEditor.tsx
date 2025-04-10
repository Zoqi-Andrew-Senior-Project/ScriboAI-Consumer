import { useEffect, useState, useRef, useCallback } from "react";
import debounce from "lodash.debounce";
import { useParams } from "react-router-dom";
import isEqual from "lodash/isEqual";
import axios from "axios";
import { useNavigate } from 'react-router-dom';
import Tooltip from "@/components/Tooltip";
import { createPortal } from 'react-dom';
import { FaPlus, FaRedo, FaSave, FaTrash, FaCheck, FaEllipsisH, FaTimes, FaChevronDown } from 'react-icons/fa';
import { toast } from "react-toastify";
import { getCSRFToken } from '@/utils/csrf';

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
  type?: 'text' | 'textarea';
  className?: string;
  inputClassName?: string; // Optional separate className for input/textarea
}

const EditableLine: React.FC<EditableLineProps> = ({ 
  text, 
  onSave, 
  type = 'text', 
  className = '',
  inputClassName = ''
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [newText, setNewText] = useState(text);

  useEffect(() => {
    setNewText(text);
  }, [text]);

  const handleDoubleClick = () => {
    setIsEditing(true);
  };

  const handleBlur = () => {
    setIsEditing(false);
    onSave(newText);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLTextAreaElement> | React.ChangeEvent<HTMLInputElement>
  ) => {
    setNewText(e.target.value);
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement> | React.KeyboardEvent<HTMLTextAreaElement>
  ) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      setIsEditing(false);
      onSave(newText);
    }
  };

  // Base classes for input/textarea
  const inputBaseClasses = "w-full p-2 bg-black/5 border border-gray-800 rounded-md focus:outline-none focus:ring-2 focus:ring-primary transition-all";
  const displayBaseClasses = "w-full text-gray-700 hover:bg-black/10 rounded-md transition-all bg-black/3";

  return (
    <div 
      className={`cursor-pointer ${className}`} 
      onDoubleClick={handleDoubleClick}
    >
      {isEditing ? (
        type === "text" ? (
          <input
            type="text"
            value={newText}
            onChange={handleChange}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            autoFocus
            className={`${inputBaseClasses} ${inputClassName}`}
          />
        ) : (
          <textarea
            value={newText}
            onChange={handleChange}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            autoFocus
            rows={4}
            className={`${inputBaseClasses} ${inputClassName}`}
          />
        )
      ) : (
        <div className={`${displayBaseClasses} ${className}`}>
          {newText || "No data available."}
        </div>
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
    <div className="bg-gray-250/15 shadow-xl rounded-lg p-4 ml-10 mb-4 border border-black w-full">
      {/* Title row with duration */}
      <div className="flex justify-between items-start gap-4 mb-3">
        <div className="flex-1 min-w-0">
          <h2 className="text-xs font-semibold text-gray-500 mb-1">TITLE</h2>
          <EditableLine 
            text={module.name}
            onSave={(newName) => updateModule({ ...module, name: newName })}
            className="text-sm font-medium text-gray-900 truncate"
          />
        </div>
        <div className="flex-shrink-0 text-right">
          <span className="text-xs font-semibold text-gray-500">DURATION</span>
          <p className="text-sm text-gray-700">{module.duration}</p>
        </div>
      </div>

      {/* Subtopics */}
      <div className="mb-3">
        <h5 className="text-xs font-semibold text-gray-500 mb-1">SUBTOPICS</h5>
        <ul className="space-y-1">
          {module.subtopics.length > 0 ? (
            module.subtopics.map((subtopic, index) => (
              <li key={index}>
                <EditableLine
                  text={subtopic}
                  onSave={(newText) => handleSubtopicChange(index, newText)}
                  className="text-sm"
                  inputClassName="text-sm py-1"
                />
              </li>
            ))
          ) : (
            <p className="text-xs text-gray-400 italic">None added</p>
          )}
        </ul>
      </div>

      {/* Features */}
      <div>
        <h5 className="text-xs font-semibold text-gray-500 mb-1">FEATURES</h5>
        <ul className="space-y-1">
          {module.features.length > 0 ? (
            module.features.map((feature, index) => (
              <Feature key={index} feature={feature} />
            ))
          ) : (
            <p className="text-xs text-gray-400 italic">None added</p>
          )}
        </ul>
      </div>
    </div>
  )
}

interface ConfirmationDialogProps {
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
}
const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({ 
  title, 
  message, 
  onConfirm, 
  onCancel, 
  confirmText = "Confirm", 
  cancelText = "Cancel" 
}) => {
  if (typeof document === 'undefined') {
    return null;
  }

  return createPortal(
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/50" 
        onClick={onCancel}
      />
      
      <div className="relative bg-tertiary rounded-lg shadow-xl w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-gray-800">{title}</h3>
          <button
            onClick={onCancel}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="mb-6">
          <p className="text-gray-700">{message}</p>
        </div>
        
        <div className="flex justify-end space-x-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 text-sm font-medium text-white bg-button-primary-bg rounded-md hover:bg-button-hover focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
interface RegenerateDialogProps {
  setRegenerateDialogPressed: React.Dispatch<React.SetStateAction<boolean>>;
  onRegenerate: (comments: string) => void;
}

const RegenerateDialog: React.FC<RegenerateDialogProps> = ({ setRegenerateDialogPressed, onRegenerate }) => {
  const [notes, setNotes] = useState("")

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNotes(e.target.value);
  };

  const onCancel = () => {
    setRegenerateDialogPressed(false);
    setNotes("");
  }

  const onRegenerateAction = () => {
    if (notes.trim()) {
      onRegenerate(notes);
      setNotes("");
    }
    setRegenerateDialogPressed(false);
  }

  if (typeof document === 'undefined') {
    return null; // For SSR
  }

  return createPortal(
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50" 
        onClick={onCancel}
      />
      
      {/* Dialog box */}
      <div className="relative bg-tertiary rounded-lg shadow-xl w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-gray-800">Regenerate Course Outline</h3>
          <button
            onClick={onCancel}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="mb-6">
          <label htmlFor="regenerate-notes" className="block text-sm font-medium text-gray-700 mb-2">
            Provide feedback for regeneration:
          </label>
          
          {/* Suggested prompts */}
          <div className="flex flex-wrap gap-2 mb-3">
            {[
              "Add a new module",
              "Re-evaluate the durations",
              "Focus more on the practical aspects",
              "Include more examples",
              "Make it more concise",
            ].map((prompt) => (
              <button
                key={prompt}
                type="button"
                onClick={() => {
                  const event = {
                    target: {
                      value: prompt,
                      name: "regenerate-notes"
                    }
                  } as React.ChangeEvent<HTMLTextAreaElement>;
                  handleChange(event);
                }}
                className="text-xs px-3 py-1 bg-black/6 hover:bg-black/15 text-gray-800 rounded-full transition-colors"
              >
                {prompt}
              </button>
            ))}
          </div>

          <textarea
            id="regenerate-notes"
            className="w-full px-3 py-2 bg-black/2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent-3"
            rows={4}
            value={notes}
            onChange={handleChange}
            placeholder="What changes would you like to see in the new version?"
          />
        </div>
        
        <div className="flex justify-end space-x-3">
          <Tooltip label="Exit the dialog." aria-label="Exit the dialog.">
            <button
              onClick={onCancel}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Cancel
            </button>
          </Tooltip>
          <Tooltip label="Regenerate the outline with the feedback." aria-label="Regenerate the outline with the feedback.">
            <button
              onClick={onRegenerateAction}
              className="px-4 py-2 text-sm font-medium text-white bg-button-primary-bg rounded-md hover:bg-button-hover focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              disabled={!notes.trim()}
            >
              Regenerate
            </button>
          </Tooltip>
        </div>
      </div>
    </div>,
    document.body
  );
};

interface OutlineEditorMenuProps {
  onRegenerate: (comments: string) => void;
  onNewPrompt: () => void;
  onAccept: () => void;
  onSave: () => void;
  onDelete: () => void;
}

const OutlineEditorMenu: React.FC<OutlineEditorMenuProps>= ({ onNewPrompt, onRegenerate, onAccept, onSave, onDelete }) => {
  const [regenerateDialogPressed, setRegenerateDialogPressed] = useState<boolean>(false);
  const [deleteDialogPressed, setDeleteDialogPressed] = useState<boolean>(false);
  const [acceptDialogPressed, setAcceptDialogPressed] = useState<boolean>(false);
  const [newOutlineDialogPressed, setNewOutlineDialogPressed] = useState<boolean>(false);

  return (
    <div className="fixed top-1/2 right-0 z-50 flex items-center justify-end  transform -translate-y-1/2">
      <div className="p-4 w-1/4">
          {/* Accept Button */}
          <Tooltip label="Accept the outline">
            <button
              onClick={() => setAcceptDialogPressed(true)}
              className={
                `m-2 bg-green-600 text-white rounded-full shadow-lg transition-all duration-300 ease-in-out p-4 w-16 h-16 hover:w-20 hover:h-20 hover:bg-green-700`
              }
            >
              <FaCheck className="w-6 h-6 mx-auto" />
            </button>
          </Tooltip>

          {/* New Button */}
          <Tooltip label="Start new outline">
            <button
              onClick={() => setNewOutlineDialogPressed(true)}
              className={`m-2 bg-blue-600 text-white rounded-full shadow-lg transition-all duration-300 ease-in-out p-4 w-16 h-16 hover:w-20 hover:h-20 hover:bg-blue-700`}
            >
              <FaPlus className="w-6 h-6 mx-auto" />
            </button>
          </Tooltip>

          {/* Regenerate Button */}
          <Tooltip label="Regenerate outline">
            <button
              onClick={() => setRegenerateDialogPressed(true)}
              className={`m-2 bg-yellow-600 text-white rounded-full shadow-lg transition-all duration-300 ease-in-out p-4 w-16 h-16 hover:w-20 hover:h-20 hover:bg-yellow-700`}
            >
              <FaRedo className="w-6 h-6 mx-auto" />
            </button>
          </Tooltip>

          {/* Save Button */}
          <Tooltip label="Save outline">
            <button
              onClick={onSave}
              className={`m-2 bg-teal-600 text-white rounded-full shadow-lg transition-all duration-300 ease-in-out p-4 w-16 h-16 hover:w-20 hover:h-20 hover:bg-teal-700`}
            >
              <FaSave className="w-6 h-6 mx-auto" />
            </button>
          </Tooltip>

          {/* Delete Button - positioned differently to be more accessible */}
          <Tooltip label="Delete outline">
            <button
              onClick={() => setDeleteDialogPressed(true)}
              className={`m-2 bg-red-600 text-white rounded-full shadow-lg transition-all duration-300 ease-in-out p-4 w-16 h-16 hover:w-20 hover:h-20 hover:bg-red-700`}
            >
              <FaTrash className="w-6 h-6 mx-auto" />
            </button>
          </Tooltip>
      </div>

      {/* Regenerate Dialog */}
      {regenerateDialogPressed && (
        <RegenerateDialog 
          setRegenerateDialogPressed={setRegenerateDialogPressed}
          onRegenerate={onRegenerate}
        />
      )}

      {deleteDialogPressed && (
        <ConfirmationDialog
          title="Delete Outline"
          message="Are you sure you want to delete this outline? This action cannot be undone."
          onConfirm={() => {
            onDelete();
            setDeleteDialogPressed(false);
          }}
          onCancel={() => setDeleteDialogPressed(false)}
          confirmText="Delete"
        />
      )}

      {acceptDialogPressed && (
        <ConfirmationDialog
          title="Accept Outline"
          message="Are you ready to accept this outline and proceed to page creation?"
          onConfirm={() => {
            onAccept();
            setAcceptDialogPressed(false);
          }}
          onCancel={() => setAcceptDialogPressed(false)}
          confirmText="Accept"
        />
      )}

      {newOutlineDialogPressed && (
        <ConfirmationDialog
          title="Start New Outline"
          message="Are you sure you want to start a new outline? Any unsaved changes will be lost."
          onConfirm={() => {
            onNewPrompt();
            setNewOutlineDialogPressed(false);
          }}
          onCancel={() => setNewOutlineDialogPressed(false)}
          confirmText="Continue"
        />
      )}
    </div>
  );
};


interface ExpandedSections {
  objectives: boolean;
  modules: boolean;
}

const OutlineEditor = () => {
  const { outId } = useParams();
  const [outlineData, setOutlineData] = useState<Outline | null>(null); // Local state for smooth typing
  const [prevOutlineData, setPreviousOutlineData] = useState<Outline | null>(null); // Local state for smooth typing
  const [loading, setLoading] = useState<boolean>(false); // Loading state
  const [expandedSections, setExpandedSections] = useState<ExpandedSections>({
    objectives: true,
    modules: true,
  });
  const [wsStatus, setWsStatus] = useState<'connected' | 'disconnected' | 'connecting'>('connecting');
  const [showJson, setShowJson] = useState(false);
  
  
  const toggleSection = (section: keyof ExpandedSections) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section], // Toggle the specific section
    }));
  };
  
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
    setWsStatus('connecting');
    if (ws.current) {
       ws.current.close(); // Close previous connection before reconnecting
    }
    
    ws.current = new WebSocket(`${import.meta.env.VITE_WS_BACKEND}/outline/${outId}/`);
    ws.current.onopen = () => {
      console.log("WebSocket Connected");
      setWsStatus('connected');
    };

    ws.current.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        const script = data.data.script;
        console.log("Received WebSocket Data:", script);
        setLoading(false);
        if (!isTyping.current) {
          setOutlineData(script);
          setPreviousOutlineData(script);
          console.log("Received A Message")
        }
      } catch (error) {
        console.error("Error parsing WebSocket message:", error);
      }
    };

    ws.current.onerror = (error) => {
      console.error("WebSocket Error:", error);
      setWsStatus('disconnected');
    };
    ws.current.onclose = () => {
      console.log("WebSocket Disconnected");
      setWsStatus('disconnected');
    };

    return () => ws.current?.close();
  }, [outId]);

  const detectChanges = ( prev: Outline | null, curr: Outline | null) => {
    if (!prev || !curr) return curr;

    let changes: Partial<Outline & { moduleChanges?: { add?: Module[]; remove?: string[]; update?: Module[] } }> = {};
    
    if (prev && curr) {
      (["title", "summary", "duration"] as Array<keyof Pick<Outline, "title" | "summary" | "duration">>).forEach((field) => {
        if (prev[field] !== curr[field]) {
          changes[field] = curr[field];
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

      if (!changes) return;

      const data = { changes: changes };
      const action = "change"

      const message = {
        action: "change",
        data: data
      }

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
    console.log("outlineData changed");
    if (!isEqual(outlineData, prevOutlineData)) {
      sendUpdate(prevOutlineData, outlineData);
    }
  }, [outlineData, sendUpdate]);

  const handleChange = ( updatedOutline: Outline ) => {
    console.log("handling change")
    setOutlineData(updatedOutline);
  }

  const debouncedSave = useCallback(
    debounce((outline) => {
      const data = {
        "action": "save",
        "data": {
          "script": outline,
        }
      };
      if (ws.current?.readyState === WebSocket.OPEN) {
        ws.current.send(JSON.stringify(data));
      }
    }, 500), // Delay WebSocket save by 500ms
    []
  );

  const sendSave = () => {
    console.log("saving");
    debouncedSave(outlineData);
  };

  const onNewPrompt = () => {
    navigate("/create-course")
  };

  const onRegenerate = (comments: string) => {
    setLoading(true);

    // Send a message to the WebSocket server to handle the regenerate action
    const data = {
      "action": "update",
      "data": {
        "comments": comments,
        "script": outlineData
      }
    }

    console.log("regenerate")

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
        navigate(`/edit/page/${response.data.course}`);
        //navigate("/outline/" + response.data.uuid)

      } catch (error) {
        console.error("ERROR:", error)
      } finally {
        setLoading(false);
      }

    }
  };

  const onDelete = async () => {
    setLoading(true);

    const uuid = outlineData?.uuid

    if (uuid !== null) {      
      const csrfToken = await getCSRFToken();
      if (!csrfToken) {
        throw new Error('Failed to get CSRF token');
      }

      const data = {
        "course": uuid
      }
  
      const url = `${import.meta.env.VITE_BACKEND_ADDRESS}/course/course/`

      try {
        await axios.delete(url,
        {
          data: data,
          headers: {
            'X-CSRFToken': csrfToken,
            'Content-Type': 'application/json'
          },
          withCredentials: true,
        });

        const toastId = toast.success(
          <div className="flex flex-col gap-1 p-1">
            <h4 className="font-semibold text-gray-100 text-base">Course Deleted Successfully!</h4>
            <p>Returning to Course Dashboard...</p>
            <div className="flex justify-end mt-2">
              <Tooltip label="Return to dashboard.">
                <button 
                  onClick={() => {
                    navigate("/course-dashboard");
                    toast.dismiss(toastId);
                  }}
                  className="bg-button-primary-bg hover:bg-button-hover text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:shadow-lg transition-transform hover:scale-105"
                >
                  Continue
                </button>
              </Tooltip>
            </div>
          </div>, 
          {
            position: "top-right",
            autoClose: 10000,
            hideProgressBar: false,
            closeOnClick: false,
            pauseOnHover: true,
            draggable: true,
            type: 'success',
            theme: "colored",
            style: {
              background: '#059669', // emerald-600
              borderLeft: '4px solid #10b981' // emerald-500
            },
            onClose: () => {
              navigate("/course-dashboard");
            }
          }
        );


      }  catch (error) {
        console.error("Error creating course:", error);
        toast.error("Failed to delete course. Please try again.", {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "light",
        });
      } finally {
          
          setLoading(false);
      }

    }
  }

  const removeModule = (index: number) => {
    if (outlineData) {
      setPreviousOutlineData(outlineData); // Save the previous state before removing a module

      setOutlineData((prevOutlineData) => {
        if (prevOutlineData) {
          const updatedModules = prevOutlineData.modules.filter((_, i) => i !== index); // Remove module at index
          return {
            ...prevOutlineData,
            modules: updatedModules,
          };
        }
        return prevOutlineData; // Just return if prevOutlineData is null
      });
    } else {
      console.error("Outline data is not available");
    }
  }

  const addNewModule = () => {
    const newModule: Module = {
      name: "New Module",
      duration: "2 hours",
      subtopics: ["Subtopic 1", "Subtopic 2"],
      features: [
        FeatureType.IMAGE,
      ],
    };

    if (outlineData) {
      setPreviousOutlineData(outlineData); // Save the previous state before updating

      setOutlineData((prevOutlineData) => {
        if (prevOutlineData) {
          // Ensure that we return a complete Outline object with all required fields
          return {
            ...prevOutlineData,
            modules: [...prevOutlineData.modules, newModule],
          };
        }
        return prevOutlineData; // Just return if prevOutlineData is null
      });
    } else {
      console.error("Outline data is not available");
    }
  }

  interface EditableSectionProps {
    title: string;
    value?: string;  // Optional value, it could be undefined
    onSave: (newValue: string) => void;  // Function to handle saving the new value
    type?: "text" | "number" | "password";  // Default type is text, but you can change it
    placeholder?: string;  // Default placeholder is "No data"
  }
  
  // EditableSection component with TypeScript types
  const EditableSection: React.FC<EditableSectionProps> = ({
    title,
    value,
    onSave,
    type = "text",
    placeholder = "No data",
  }) => (
    <div className="mb-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-2">{title}:</h3>
      <EditableLine 
        text={value ?? placeholder}
        onSave={onSave}
      />
    </div>
  );

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="grid grid-cols-1 gap-6 w-full max-w-6xl p-4">
        {/* The Header */}
        <div className="flex flex-col items-center justify-center text-center mb-12">
          <div className="w-40 h-40 rounded-full mx-auto mb-6 overflow-hidden">
            <img src="/logo.png" alt="Scribo.AI Logo" className="w-full h-full object-cover shadow-lg" />
          </div>
          <h2 className="text-4xl font-bold mb-6 text-tertiary">Outline Editor</h2>
          <p className="text-lg text-tertiary-light">
            All the tools you need to build and manage your course content — live editing included.
          </p>
        </div>

        {/* The Outline */}
        <div className="bg-white p-8 rounded-lg shadow-md w-full border border-gray-200">
          <div className="mb-8">
            <div className="space-y-6">
              <h1 className="block text-gray-700 text-lg font-bold mb-2">Title:</h1>
              <EditableLine 
                text={outlineData?.title ?? "No data."} 
                onSave={(newTitle) => {
                  setOutlineData((prev) => prev ? { ...prev, title: newTitle } : prev);
                }}
              />
              <h4 className="block text-gray-700 text-lg font-bold mb-2">Duration:</h4>
              <p className="">{outlineData?.duration || "No duration specified"}</p>

              <h3 className="block text-gray-700 text-lg font-bold mb-2">Summary:</h3>
              <EditableLine 
                  text={outlineData?.summary ?? "No data."} 
                  onSave={(newSummary) => {
                    setOutlineData((prev) => prev ? { ...prev, summary: newSummary } : prev);
                  }} 
                  type="textarea"
              />
              <div className="border-b border-gray-200 pb-2 mb-4">
                <button 
                  onClick={() => toggleSection('objectives')}
                  className="flex items-center w-full justify-between"
                >
                  <h3 className="block text-gray-700 text-lg font-bold mb-2">Objectives</h3>
                  <FaChevronDown className={`transition-transform ${expandedSections.objectives ? 'rotate-180' : ''}`}/>
                </button>
                {expandedSections.objectives && (
                  <div className="mt-4">
                    <ul className="space-y-3 pl-5">
                        {outlineData?.objectives && outlineData.objectives.length  > 0 ? (
                          outlineData.objectives.map((objective, index) => (
                            <li key={index} className="relative group">
                              <div className="absolute -left-5 top-2.5 w-2 h-2 bg-gray-400 rounded-full" />
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
                )}
              </div>
              
              <div className="border-b border-gray-200 pb-2 mb-4">
                <button 
                  onClick={() => toggleSection('modules')}
                  className="flex items-center w-full justify-between"
                >
                  <h3 className="block text-gray-700 text-lg font-bold mb-2">Modules</h3>
                  <FaChevronDown className={`transition-transform ${expandedSections.modules ? 'rotate-180' : ''}`}/>
                </button>
                {expandedSections.modules && (
                <div className="space-y-4">
                  {outlineData?.modules?.length > 0 ? (
                    outlineData.modules.map((module, index) => (
                      <div key={module.uuid} className="relative group max-w-1/2">
                        <Module 
                          module={module}
                          updateModule={(updated) => updateModule(index, updated)}
                        />
                        <button 
                          onClick={() => removeModule(index)}
                          className="absolute -top-2 -right-12 opacity-0 group-hover:opacity-100
                                    bg-red-500 text-white rounded-full p-1 transition-opacity"
                        >
                          <FaTimes size={12} />
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      No modules yet. Click "Add Module" to get started.
                    </div>
                  )}
                  <button 
                    onClick={addNewModule}
                    className="w-full py-3 bg-blue-50 hover:bg-blue-100 text-blue-600 
                              rounded-lg border-2 border-dashed border-blue-300 transition-colors
                              flex items-center justify-center gap-2"
                  >
                    <FaPlus />
                    <span>Add New Module</span>
                  </button>
                </div>
                )}
              </div>
            </div>
          </div>

          {/* <div className="">
            <h4>View Raw JSON</h4>
            <pre className="bg-gray-100 p-4 rounded-md overflow-auto">{JSON.stringify(outlineData, null, 2)}</pre>
          </div> */}
        </div>
      </div>
      {typeof document !== 'undefined' && createPortal(
        <>
          {loading && (
            <div className="fixed top-0 left-0 right-0 bottom-0 items-center justify-center flex z-50 bg-indigo-50/75">
              <div className="animate-pulse h-1/6 w-1/8">
                <img src="/minilogo.png" alt="logo" />
              </div>
            </div>
          )}
        </>,
        document.body
      )}
      
      {/* Toolbar */}
      <OutlineEditorMenu onNewPrompt={onNewPrompt} onRegenerate={onRegenerate} onAccept={onAccept} onSave={sendSave} onDelete={onDelete} />      
          
      <div className="fixed bottom-4 right-4 flex items-center gap-2 z-50 bg-white/90 rounded-md p-1">
        <span
          className={`h-3 w-3 rounded-full ${
            wsStatus === 'connected'
              ? 'bg-green-500'
              : wsStatus === 'connecting'
              ? 'bg-yellow-400 animate-pulse'
              : 'bg-red-500'
          }`}
        ></span>
        <span className="text-sm text-gray-700 bg-whi">
          {wsStatus === 'connected'
            ? 'Connected'
            : wsStatus === 'connecting'
            ? 'Connecting...'
            : 'Offline'}
        </span>
      </div>
    </div>
  );
};

export default OutlineEditor;