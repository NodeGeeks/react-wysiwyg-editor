import { WysiwygEditor } from 'nodegeeks-react-wysiwyg-editor';
import React from 'react';
import './App.css';

function App() {
  const [content, setContent] = React.useState("<p>Hello World!</p>");

  return (
    <>
    React App
      <WysiwygEditor
        content={content}
        onChange={setContent}
      />
    </>
  );
}

export default App;
