import { useEffect, useState, useRef, useCallback } from "react";
import debounce from "lodash.debounce";
import { useParams } from "react-router-dom";
import MDEditor from '@uiw/react-md-editor';

const useWebSocketAction = (ws) => {
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

  // Attach predefined methods dynamically
  sendAction.next = () => sendAction("next");
  sendAction.prev = () => sendAction("back");
  sendAction.save = () => sendAction("save");

  return sendAction;
};

const PageEditor = () => {
  const { docId } = useParams();
  const [content, setContent] = useState(""); // Local state for smooth typing
  const [metaData, setMetaData] = useState(null)
  const ws = useRef(null);
  const isTyping = useRef(false); // Track typing activity
  const debouncedAction = useWebSocketAction(ws);

  useEffect(() => {
    ws.current = new WebSocket(`ws://localhost:8000/ws/document/${docId}/`);

    ws.current.onopen = () => console.log("WebSocket Connected");

    ws.current.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (!isTyping.current) {
          setContent(data.data.content);
          console.log(data.meta)
          setMetaData(data.meta);
          console.log("META", metaData)
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
        console.log({ content: newContent })
        const message = {
          "data": {
            content: newContent
          }
        }
        ws.current.send(JSON.stringify(message));
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
      <h1>Hello {metaData?.currentPage}</h1>
      <h1>{metaData?.current_order}/{metaData?.total}</h1>
      <button onClick={debouncedAction.next}>Next</button>
      <button onClick={debouncedAction.prev}>Back</button>
      <button onClick={debouncedAction.save}>Save</button>
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
