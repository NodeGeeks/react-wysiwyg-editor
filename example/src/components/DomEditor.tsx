import React from 'react';
import { ModernEditorComponent } from '../../../src/ModernWysiwygEditor';

const DomEditor: React.FC = () => {
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
      <h1>DOM-based WYSIWYG Editor Example</h1>
      <ModernEditorComponent
        content={content}
        onChange={setContent}
        templates={templates}
        bindings={bindings}
        debug={true}
      />
    </div>
  );
};

export default DomEditor;