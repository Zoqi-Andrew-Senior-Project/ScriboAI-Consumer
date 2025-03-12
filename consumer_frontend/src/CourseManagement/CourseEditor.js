import { useEffect, useState } from "react";

const DocumentEditor = ({ docId }) => {
  const [content, setContent] = useState("");
  const ws = new WebSocket(`ws://localhost:8000/ws/document/1/`);

  useEffect(() => {
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setContent(data.content);
    };

    return () => ws.close();
  }, [ws]);

  const handleChange = (e) => {
    const newContent = e.target.value;
    setContent(newContent);
    ws.send(JSON.stringify({ content: newContent }));
  };

  return (
    <textarea value={content} onChange={handleChange} rows={10} cols={50} />
  );
};

export default DocumentEditor;
