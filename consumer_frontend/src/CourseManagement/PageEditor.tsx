import { useEffect, useState, useRef, useCallback } from "react";
import debounce from "lodash.debounce";
import { useParams } from "react-router-dom";
import { MDXEditor, MDXEditorMethods, UndoRedo, BoldItalicUnderlineToggles, toolbarPlugin, BlockTypeSelect, DiffSourceToggleWrapper } from '@mdxeditor/editor'
import { headingsPlugin, diffSourcePlugin, listsPlugin } from '@mdxeditor/editor'
import { useNavigate } from 'react-router-dom';

import '@mdxeditor/editor/style.css'
import './pageeditor.css'

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
  const [metaData, setMetaData] = useState<MetaData | null>(null)
  const ws = useRef<WebSocket | null>(null);
  const isTyping = useRef(false); // Track typing activity
  const debouncedAction = useWebSocketAction(ws);
  const ref = useRef<MDXEditorMethods>(null); // Adjust the type of ref as needed
  const navigate = useNavigate();
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [savingStatus, setSavingStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

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

  interface ProgressBarProps {
    progress: number;
  }

  const ProgressBar: React.FC<ProgressBarProps> = ({ progress }) => {
    // Ensure progress is a number between 0 and 100
    const safeProgress = Math.round(Math.min(Math.max(progress, 0), 100));
  
    return (
      <div className="w-full bg-gray-300 rounded-lg h-6 overflow-hidden relative">
  
        {/* Top bar (progress) */}
        <div
          className="bg-blue-500 h-full transition-all relative"
          style={{ width: `${safeProgress}%` }}
          role="progressbar"
          aria-valuenow={safeProgress}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          {/* Percentage Text */}
          <div className="absolute inset-0 flex items-center justify-center text-white font-semibold">
            {safeProgress}%
          </div>
        </div>
        {/* Bottom bar (background) */}
        <div className="w-full bg-gray-400 h-full rounded-lg min-w-[20em] " />
      </div>
    );
  };

  return (
    <div className="w-full mx-auto px-4 py-6 flex flex-col items-center space-y-6">
        <h1 className="text-3xl font-semibold text-center">Page Editor</h1>
        <p className="text-center">Edit each page in the course!</p>

        <div className="w-full max-w-4xl">
          <div className="flex items-center justify-between space-x-3 bg-gray-100 p-4 rounded-lg shadow-md">
            
            <div className="flex items-center gap-2 flex-1 justify-center">
              <button
                onClick={debouncedAction.prev}
                className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 focus:ring-2 focus:ring-gray-400 transition-all"
              >
                Back
              </button>

              <ProgressBar progress={(metaData?.current_order / metaData?.total) * 100} />

              <button
                onClick={debouncedAction.next}
                className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 focus:ring-2 focus:ring-gray-400 transition-all"
              >
                Next
              </button>
            </div>

            
            <div className="flex items-center gap-2">
              <button
                onClick={debouncedAction.save}
                className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 focus:ring-2 focus:ring-blue-400 transition-all"
              >
                Save
              </button>
              <button
                onClick={() => navigate(`/complete-course/${docId}`)}
                className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 focus:ring-2 focus:ring-green-400 transition-all"
              >
                Accept
              </button>
            </div>
          </div>
          {/* Save Status Indicator */}
          <div className="text-sm text-gray-600 text-right mt-2">
            {savingStatus === 'saving' && <span className="text-yellow-500">Saving...</span>}
            {savingStatus === 'saved' && <span className="text-green-500">{getLastSavedText()}</span>}
            {savingStatus === 'idle' && <span className="text-gray-500">No changes</span>}
          </div>
        </div>
        <div className="editor prose lg:prose-l mx-auto bg-white shadow-lg rounded-md p-10 max-w-none overflow-auto">
          <MDXEditor ref={ref} markdown={content} onChange={handleChange} plugins={[
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
            listsPlugin()
          ]}/>
      </div>
    </div>
  );
};

export default PageEditor;
