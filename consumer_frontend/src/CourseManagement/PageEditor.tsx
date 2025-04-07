import { useEffect, useState, useRef, useCallback } from "react";
import debounce from "lodash.debounce";
import { useParams } from "react-router-dom";
import { MDXEditor, MDXEditorMethods, UndoRedo, BoldItalicUnderlineToggles, toolbarPlugin, BlockTypeSelect, DiffSourceToggleWrapper } from '@mdxeditor/editor'
import { headingsPlugin, diffSourcePlugin, listsPlugin } from '@mdxeditor/editor'
import { useNavigate } from 'react-router-dom';
import { HiArrowsPointingOut , HiArrowsPointingIn, HiArrowLeft, HiArrowRight } from "react-icons/hi2";
import { HiCheck, HiOutlineSave } from "react-icons/hi";
import '@mdxeditor/editor/style.css'
import './pageeditor.css'
import Progressbar from "@/components/Progressbar";
import Tooltip from "@/components/Tooltip";

interface WebSocketAction {
  next: () => void;
  prev: () => void;
  save: () => void;
  (action: any): void;
}

const useWebSocketAction = (ws: React.RefObject<WebSocket | null>) => {
  const sendAction = useCallback(
    debounce((action) => {
      console.log(`WebSocket Request: ${action}`);
      const data = { action };
      if (ws.current?.readyState === WebSocket.OPEN) {
        ws.current.send(JSON.stringify(data));
      }
    }, 500), // 500ms debounce
    [ws]
  );

  const webSocketAction = sendAction as unknown as WebSocketAction;

  // Attach predefined methods dynamically
  webSocketAction.next = () => sendAction("next");
  webSocketAction.prev = () => sendAction("back");
  webSocketAction.save = () => sendAction("save");

  return webSocketAction;
};

interface MetaData{
  prevPage: string,
  nextPage: string,
  currentPage: string,
  course: string,
  total: number,
  current_order: number
}

const PageEditor = () => {
  const { docId } = useParams();
  const [content, setContent] = useState<string>("No data.");  // Local state for smooth typing
  const [metaData, setMetaData] = useState<MetaData>({
    prevPage: "",
    nextPage: "",
    currentPage: "",
    course: "",
    total: 1, // Default value
    current_order: 0, // Default value
  });
  const ws = useRef<WebSocket | null>(null);
  const isTyping = useRef(false); // Track typing activity
  const debouncedAction = useWebSocketAction(ws);
  const ref = useRef<MDXEditorMethods>(null); // Adjust the type of ref as needed
  const navigate = useNavigate();
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [savingStatus, setSavingStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isHovered, setIsHovered] = useState(false)
  
  const toggleFullscreen = () => {
    const doc = document as Document;
    const docEl = document.documentElement;
  
    if (!document.fullscreenElement) {
      docEl.requestFullscreen?.().catch((err) =>
        console.error("Failed to enter fullscreen:", err)
      );
      setIsFullscreen(true);
    } else {
      doc.exitFullscreen?.().catch((err) =>
        console.error("Failed to exit fullscreen:", err)
      );
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    if (ws.current) {
       ws.current.close(); // Close previous connection before reconnecting
    }
    ws.current = new WebSocket(`${import.meta.env.VITE_WS_BACKEND}/document/${docId}/`);

    ws.current.onopen = () => console.log("WebSocket Connected");

    ws.current.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (!isTyping.current) {
          setContent(data.data.content);
          ref.current?.setMarkdown(data.data.content);
          setMetaData(data.meta);
        }
        console.log("saved");
        setSavingStatus('saved');
        setLastSaved(new Date());
      } catch (error) {
        console.error("Error parsing WebSocket message:", error);
      }
    };

    ws.current.onerror = (error) => console.error("WebSocket Error:", error);
    ws.current.onclose = () => console.log("WebSocket Disconnected");

    return () => ws.current?.close();
  }, [docId]);

  // Debounced function to send updates with batching
  const sendUpdate = useCallback(
    debounce((newContent) => {
      if (ws.current?.readyState === WebSocket.OPEN) {
        console.log("saving");
        setSavingStatus('saving');
        const message = {
          "data": {
            content: newContent
          }
        }
        ws.current.send(JSON.stringify(message));

        setTimeout(() => {
          console.log('saved');
          setSavingStatus('saved');
          setLastSaved(new Date());
        }, 1000);
      }
      isTyping.current = false;
    }, 500), // Delay WebSocket updates by 500ms
    []
  );

  const handleChange = (newValue: string | undefined) => {
    if (newValue !== undefined) {
      setContent(newValue);
      ref.current?.setMarkdown(newValue);
      isTyping.current = true; // Prevent overwriting while typing
      sendUpdate(newValue);
    }
  };

  const getLastSavedText = () => {
    if (!lastSaved) return "Not saved yet";
    const diff = Math.round((new Date().getTime() - lastSaved.getTime()) / 1000);
    return diff < 60 ? `Saved ${diff} seconds ago` : `Saved ${Math.floor(diff / 60)} minutes ago`;
  }

  return (
    <div className="w-full mx-auto px-4 py-6 flex flex-col items-center space-y-6">
      {/* Header */}
      <div className="flex flex-col items-center justify-center text-center mb-12">
        <div className="w-24 h-24 rounded-full mx-auto mb-6 overflow-hidden">
          <img src="/logo.png" alt="Scribo.AI Logo" className="w-full h-full object-cover shadow-lg" />
        </div>
        <h2 className="text-4xl font-bold mb-6 text-tertiary">Page Editor</h2>
        <p className="text-lg text-tertiary-light">
          Congrats, Scribo generated pages for each module in your course outline!
          Make changes, browse through each page, and save when needed to build your perfect course.
          {metaData.current_order}
        </p>
      </div>

      {/* Editor */}
      <div
        className={
          `${
            isFullscreen
            ? 'fixed top-0 left-0 w-screen h-screen p-15 overflow-auto bg-white prose max-w-none transition-all duration-1000 ease-in-out transform scale-100 opacity-100'
            : 'prose bg-white rounded-[45px] p-2.5 max-w-none overflow-auto w-9/10 h-screen transition-all duration-1000 ease-in-out transform scale-95 opacity-100'
          }`
        }
      >
        <MDXEditor
          ref={ref}
          markdown={content}
          onChange={handleChange}
          plugins={[
            toolbarPlugin({
              toolbarClassName: 'my-classname',
              toolbarContents: () => (
                <>
                  <DiffSourceToggleWrapper>
                    <UndoRedo />
                    <BoldItalicUnderlineToggles />
                    <BlockTypeSelect />
                  </DiffSourceToggleWrapper>
                </>
              ),
            }),
            headingsPlugin(),
            diffSourcePlugin(),
            listsPlugin(),
          ]}
        />
      </div>

      {/* Page Navigation */}
      <div 
        className="fixed bottom-0 left-0 right-0 py-4 z-40 group w-auto"
      >      
        <div className="flex items-center justify-center gap-8 mx-auto w-2/3 bg-gray-50/75 pl-5 pr-5 rounded-full">
          {/* Left Arrow */}
          <Tooltip label="Go to previous page.">
            <button
              onClick={debouncedAction.prev}
              className={`text-black p-2 rounded-md hover:bg-gray-600 hover:text-white transition-all`}
            >
              <HiArrowLeft className="w-8 h-6" strokeWidth={3} />
            </button>
          </Tooltip>

          {/* Progress Bar */}
          <div 
            className="flex-1 bg-gray-300 rounded-lg h-6 overflow-hidden transition-all duration-300"
            style={{ pointerEvents: 'none' }}
          >
            <Progressbar progress={((metaData?.current_order - 1) / metaData?.total) * 100} />
          </div>

          {/* Right Arrow */}
          <Tooltip label="Go to next page.">
            <button
              onClick={debouncedAction.next}
              className={`text-black p-2 rounded-md hover:bg-gray-600 hover:text-white transition-all`}
            >
              <HiArrowRight className="w-8 h-6" strokeWidth={3} />
            </button>
          </Tooltip>
        </div>
        {/* Save Status Indicator */}
        {/* <div className="text-sm text-gray-600 text-right mt-2">
          {savingStatus === 'saving' && <span className="text-yellow-500">Saving...</span>}
          {savingStatus === 'saved' && <span className="text-green-500">{getLastSavedText()}</span>}
          {savingStatus === 'idle' && <span className="text-gray-500">No changes</span>}
        </div> */}
      </div>



      {/* Actions */}
      <div className="fixed bottom-0 right-0 z-75"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          style={{ width: '200px', height: '200px'}}
          >

        {/* Buttons container */}
        <div
          className={`relative transition-transform duration-300 ease-out ${isHovered ? 'scale-100' : 'scale-90'}`}
          style={{ width: '128px', height: '128px' }}
        >
          {/* Save Button */}
          <div className="absolute" style={{ top: 100, left: 100 }}>
            <Tooltip label="Save your changes.">
              <button
                onClick={() => {}}
                className={`absolute bg-blue-500 text-white rounded-full shadow-lg transition-all duration-300 ease-in-out
                  ${isHovered ? 'p-4 w-16 h-16 -top-20 -left-20' : 'p-2 w-12 h-12 -top-0 -left-0'}`}
              >
                <HiOutlineSave className="w-full h-full" />
              </button>
            </Tooltip>
          </div>

          {/* Accept Button */}
          <div className="absolute" style={{ top: 100, left: 100 }}>
            <Tooltip label="Accept all pages">
              <button
                onClick={() => navigate(`/complete-course/${docId}`)}
                className={`absolute bg-green-500 text-white rounded-full shadow-lg transition-all duration-300 ease-in-out
                  ${isHovered ? 'p-4 w-16 h-16 -top-0 -left-30' : 'p-2 w-12 h-12 -top-0 left-0'}`}
              >
                <HiCheck className="w-full h-full" />
              </button>
            </Tooltip>
          </div>

          {/* Fullscreen Button */}
          <div className="absolute" style={{ top: 100, left: 100 }}>
            <Tooltip label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}>
              <button
                onClick={toggleFullscreen}
                className={`absolute bg-gray-800 text-white rounded-full shadow-lg transition-all duration-300 ease-in-out
                  ${isHovered ? 'p-4 w-16 h-16 -top-30 -left-0' : 'p-2 w-12 h-12 -top-0 -left-0'}`}
              >
                {isFullscreen ? (
                  <HiArrowsPointingIn className="w-full h-full" />
                ) : (
                  <HiArrowsPointingOut className="w-full h-full" />
                )}
              </button>
            </Tooltip>
          </div>
        </div>
      </div>

    </div>
  );
};

export default PageEditor;
