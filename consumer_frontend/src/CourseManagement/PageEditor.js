import { useEffect, useState, useRef, useCallback } from "react";
import debounce from "lodash.debounce";
import { useParams } from "react-router-dom";

const PageEditor = () => {
  const { docId } = useParams();
  const [content, setContent] = useState(""); // Local state for smooth typing
  const ws = useRef(null);
  const isTyping = useRef(false); // Track typing activity

  useEffect(() => {
    ws.current = new WebSocket(`ws://localhost:8000/ws/document/${docId}/`);

    ws.current.onopen = () => console.log("WebSocket Connected");

    ws.current.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (!isTyping.current) {
          setContent(data.content);
        }
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
        ws.current.send(JSON.stringify({ content: newContent }));
      }
      isTyping.current = false;
    }, 500), // Delay WebSocket updates by 500ms
    []
  );

  const handleChange = (e) => {
    const newContent = e.target.value;
    setContent(newContent);
    isTyping.current = true; // Prevent overwriting while typing
    sendUpdate(newContent);
  };

  return <textarea value={content} onChange={handleChange} rows={10} cols={50} />;
};

export default PageEditor;
