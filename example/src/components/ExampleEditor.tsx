import React from 'react';
import { WysiwygEditor } from '../../../src/WysiwygEditor';

const ExampleEditor: React.FC = () => {
  const [content, setContent] = React.useState('');

  // Example templates and bindings from updated-example.tsx
  const templates = [
    {
      name: 'Welcome Email',
      content: `
        <h1>Welcome {{user.firstName}}!</h1>
        <p>We're excited to have you join us at {{company.name}}.</p>
        <p>Your account details:</p>
        <ul>
          <li>Username: {{user.email}}</li>
          <li>Role: {{user.role}}</li>
        </ul>
      `
    }
  ];

  const bindings = {
    user: {
      firstName: 'John',
      email: 'john@example.com',
      role: 'Member'
    },
    company: {
      name: 'TechCorp'
    }
  };
  return (
    <div>
      <h1>Simple WYSIWYG Editor Example</h1>
      <WysiwygEditor
        content={content}
        setContent={setContent}
        templates={templates}
        bindings={bindings}
        debug={true}
      />
      <h1>String Output</h1>
      {content && <pre>{content}</pre>}
      <h1>HTML Output</h1>
      {content && <div dangerouslySetInnerHTML={{ __html: content }} />}
    </div>
  );
};

export default ExampleEditor;