import { useEffect, useState, useRef, useCallback } from "react";
import debounce from "lodash.debounce";
import { useParams } from "react-router-dom";
import MDEditor from '@uiw/react-md-editor';

const PageEditor = () => {
  const { docId } = useParams();
  const [content, setContent] = useState(""); // Local state for smooth typing
  const ws = useRef(null);
  const isTyping = useRef(false); // Track typing activity
  const [value, setValue] = useState("**Hello world!!!**");

  useEffect(() => {
    ws.current = new WebSocket(`ws://localhost:8000/ws/document/${docId}/`);

    ws.current.onopen = () => console.log("WebSocket Connected");

    ws.current.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (!isTyping.current) {
          setContent(data.data.content);
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

  const handleChange = (newValue) => {
    setContent(newValue);
    isTyping.current = true; // Prevent overwriting while typing
    sendUpdate(newValue);
  };

  return (
  <div>
    <div data-color-mode="light">
      <MDEditor
        value={content}
        onChange={handleChange}
      />
      {/* <MDEditor.Markdown source={value} style={{ whiteSpace: 'pre-wrap' }} /> */}
    </div>
  </div>
  );
};

export default PageEditor;
