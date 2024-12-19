import { useState } from 'react';
import { WysiwygEditor } from '../../src/WysiwygEditor';
import './App.css';

function App() {
  const [content, setContent] = useState('');

  const templates = [
    {
      name: 'Welcome Email',
      content: '<h1>Welcome {{name}}!</h1><p>We\'re excited to have you on board.</p>'
    },
    {
      name: 'Newsletter',
      content: '<h2>{{title}}</h2><p>{{content}}</p>'
    }
  ];

  const [bindings, setBindings] = useState({
    name: 'John Doe',
    title: 'Monthly Newsletter',
    content: 'Here are the latest updates...'
  })
  return (
    <>
      <h1>NodeGeeks React WYSIWYG Editor</h1>
      <input value={bindings.name} onChange={(e)=>{
        setBindings({...bindings, name: e.target.value});
      }} />
      <br />
      <br />
      <WysiwygEditor
        content={content}
        onChange={setContent}
        templates={templates}
        bindings={bindings}
      />
    </>
  )
}

export default App
