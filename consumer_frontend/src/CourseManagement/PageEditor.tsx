import { useEffect, useState, useRef, useCallback } from "react";
import debounce from "lodash.debounce";
import { useParams } from "react-router-dom";
import MDEditor from '@uiw/react-md-editor';
import { MDXEditor, MDXEditorMethods, UndoRedo, BoldItalicUnderlineToggles, toolbarPlugin, BlockTypeSelect, DiffSourceToggleWrapper } from '@mdxeditor/editor'
import { headingsPlugin, diffSourcePlugin, listsPlugin } from '@mdxeditor/editor'

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

  useEffect(() => {
    if (ws.current) {
       ws.current.close(); // Close previous connection before reconnecting
    }
    ws.current = new WebSocket(`ws://localhost:8000/ws/document/${docId}/`);

    ws.current.onopen = () => console.log("WebSocket Connected");

    ws.current.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (!isTyping.current) {
          setContent(data.data.content);
          ref.current?.setMarkdown(data.data.content);
          setMetaData(data.meta);
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

  const handleChange = (newValue: string | undefined) => {
    if (newValue !== undefined) {
      setContent(newValue);
      ref.current?.setMarkdown(newValue);
      isTyping.current = true; // Prevent overwriting while typing
      sendUpdate(newValue);
    }
  };

  return (
  <div>
    <div data-color-mode="light">
      <h1>Hello {metaData?.currentPage}</h1>

      <button onClick={debouncedAction.save}>Save</button>
      <div className='doc-buttons'>
        <button onClick={debouncedAction.prev}>Back</button>
        <p>{metaData?.current_order}/{metaData?.total}</p>
        <button onClick={debouncedAction.next}>Next</button>
      </div>
      {/* <MDEditor
        value={content}
        onChange={handleChange}
      /> */}

      <div className='editor'>
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
  </div>
  );
};

export default PageEditor;
