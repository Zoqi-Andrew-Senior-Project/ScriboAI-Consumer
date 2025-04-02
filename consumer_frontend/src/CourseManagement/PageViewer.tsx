import React, { useCallback, useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import './pageeditor.css'
import debounce from "lodash.debounce";
import { useParams } from "react-router-dom";

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

const PageViewer: React.FC = () => {
    const { docId } = useParams();
    const [content, setContent] = useState<string>("No data.");  // Local state for smooth typing
    const [metaData, setMetaData] = useState<MetaData | null>(null)
    const ws = useRef<WebSocket | null>(null);
    const debouncedAction = useWebSocketAction(ws);
    const ref = useRef<any>(null); 
    
    useEffect(() => {
        if (ws.current) {
            ws.current.close(); // Close previous connection before reconnecting
        }
        ws.current = new WebSocket(`wss://scriboai.tech/ws/document/${docId}/`);

        ws.current.onopen = () => console.log("WebSocket Connected");

        ws.current.onmessage = (event) => {
            try {
            const data = JSON.parse(event.data);

            setContent(data.data.content);
            ref.current?.setMarkdown(data.data.content);
            setMetaData(data.meta);
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
        console.log({ content: newContent })
        const message = {
            "data": {
            content: newContent
            }
        }
        ws.current.send(JSON.stringify(message));
        }
    }, 500), // Delay WebSocket updates by 500ms
    []
    );

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
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-between space-x-3 bg-gray-100 p-4 rounded-lg shadow-md mb-6">
          
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
        </div>

        <div className="prose lg:prose-xl mx-auto bg-white rounded-md p-10 h-screen overflow-auto">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
        </div>
      </div>
    );
  };
  
  export default PageViewer;