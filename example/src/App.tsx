import { useState } from 'react'
import { WysiwygEditor } from '../../src/WysiwygEditor'
import './App.css'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'

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
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>NodeGeeks React WYSIWYG Editor</h1>
      <input value={bindings.name} onChange={(e)=>{
        setBindings({...bindings, name: e.target.value});
      }} />
      {bindings.name}
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
