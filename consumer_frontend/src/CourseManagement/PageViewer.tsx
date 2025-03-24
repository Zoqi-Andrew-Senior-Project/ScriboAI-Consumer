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
        ws.current = new WebSocket(`ws://localhost:8000/ws/document/${docId}/`);

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
  
    return (
        <div>      
            <div className='doc-buttons'>
                <button onClick={debouncedAction.prev}>Back</button>
                <p>{metaData?.current_order}/{metaData?.total}</p>
                <button onClick={debouncedAction.next}>Next</button>
            </div>
            <div className="editor">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
            </div>
        </div>
    );
  };
  
  export default PageViewer;