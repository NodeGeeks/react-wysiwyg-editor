import { useState } from 'react';
import { WysiwygEditor } from '../../src/WysiwygEditor';
import './App.css';

function App() {
  const [content, setContent] = useState('');

  const templates = [
    {
      name: 'Welcome Email',
      content: '<h1>Welcome {{contact.firstName}}!</h1><p>We\'re excited to have you on board.</p>'
    },
    {
      name: 'Newsletter',
      content: '<h2>{{title}}</h2><p>{{content}}</p>'
    }
  ];

  const [bindings, setBindings] = useState({
    contact: {  
      firstName: 'John',
      email: 'john.doe@example.com',
      address: {
        street: '123 Main St',
        city: 'Anytown',
        state: 'CA',
        zip: '12345'
      }
    },
    title: 'Monthly Newsletter',
    content: 'Here are the latest updates...'
  })
  return (
    <>
      <h1>NodeGeeks React WYSIWYG Editor</h1>
      <input value={bindings.contact.firstName} onChange={(e)=>{
        setBindings({...bindings, contact: {...bindings.contact, firstName: e.target.value}});
      }} />
      <br />
      <br />
      <WysiwygEditor
        content={content}
        onChange={setContent}
        templates={templates}
        bindings={bindings}
        debug={true}
      />
      {content}
    </>
  )
}

export default App
