import React from 'react';
import { WysiwygEditor } from '../../../src/WysiwygEditor';

const ExampleEditor: React.FC = () => {
  const [content, setContent] = React.useState('');

  const handleBindingChange = (path: string[], value: string) => {
    setBindings(prev => {
      const newBindings = { ...prev };
        let current: any = newBindings;
      for (let i = 0; i < path.length - 1; i++) {
        current = current[path[i]];
      }
      current[path[path.length - 1]] = value;
      return newBindings;
    });
  };

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

  const [bindings, setBindings] = React.useState({
    user: {
      firstName: 'John',
      email: 'john@example.com',
      role: 'Member'
    },
    company: {
      name: 'TechCorp'
    }
  });
  return (
    <div>
      <h1>Simple WYSIWYG Editor Example</h1>
      {/* Binding Inputs */}
      <div style={{ marginBottom: '20px' }}>
        <h3>Update Template Variables</h3>
        <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
          <input
            placeholder="First Name"
            value={bindings.user.firstName}
            onChange={(e) => handleBindingChange(['user', 'firstName'], e.target.value)}
          />
          <input
            placeholder="Email"
            value={bindings.user.email}
            onChange={(e) => handleBindingChange(['user', 'email'], e.target.value)}
          />
          <input
            placeholder="Role"
            value={bindings.user.role}
            onChange={(e) => handleBindingChange(['user', 'role'], e.target.value)}
          />
          <input
            placeholder="Company Name"
            value={bindings.company.name}
            onChange={(e) => handleBindingChange(['company', 'name'], e.target.value)}
          />
        </div>
      </div>

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