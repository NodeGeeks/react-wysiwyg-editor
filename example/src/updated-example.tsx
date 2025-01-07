import { useState } from 'react';
import { ModernEditorComponent } from '../../src/ModernWysiwygEditor';

function UpdatedExample() {
  const [content, setContent] = useState('');

  // Example templates demonstrating various use cases
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
        <p>Get started by:</p>
        <ol>
          <li>Completing your profile</li>
          <li>Exploring our {{features.primary}} feature</li>
          <li>Joining our community</li>
        </ol>
      `
    },
    {
      name: 'Newsletter',
      content: `
        <div style="max-width: 600px; margin: 0 auto;">
          <h2>{{newsletter.title}}</h2>
          <p class="date">{{newsletter.date}}</p>
          <div class="main-content">
            {{newsletter.content}}
          </div>
          <div class="footer">
            <p>Stay connected with us:</p>
            <ul>
              {{#each socialLinks}}
                <li><a href="{{this.url}}">{{this.platform}}</a></li>
              {{/each}}
            </ul>
          </div>
        </div>
      `
    }
  ];

  // Example bindings with nested objects and arrays
  const [bindings, setBindings] = useState({
    user: {
      firstName: 'John',
      email: 'john.doe@example.com',
      role: 'Member'
    },
    company: {
      name: 'TechCorp',
      domain: 'techcorp.com'
    },
    features: {
      primary: 'Dashboard',
      secondary: ['Analytics', 'Reports', 'Settings']
    },
    newsletter: {
      title: 'Monthly Updates',
      date: new Date().toLocaleDateString(),
      content: '<p>Check out our latest features and updates!</p>'
    },
    socialLinks: [
      { platform: 'Twitter', url: 'https://twitter.com' },
      { platform: 'LinkedIn', url: 'https://linkedin.com' }
    ]
  });

  // Example of updating bindings
  const handleUserUpdate = (field: string, value: string) => {
    setBindings(prev => ({
      ...prev,
      user: {
        ...prev.user,
        [field]: value
      }
    }));
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
      <h1>Enhanced WYSIWYG Editor Example</h1>
      
      {/* User input controls */}
      <div style={{ marginBottom: '20px' }}>
        <h3>Update Template Variables</h3>
        <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
          <input
            placeholder="First Name"
            value={bindings.user.firstName}
            onChange={(e) => handleUserUpdate('firstName', e.target.value)}
          />
          <input
            placeholder="Email"
            value={bindings.user.email}
            onChange={(e) => handleUserUpdate('email', e.target.value)}
          />
          <input
            placeholder="Role"
            value={bindings.user.role}
            onChange={(e) => handleUserUpdate('role', e.target.value)}
          />
        </div>
      </div>

      {/* Editor Component */}
      <div style={{ marginBottom: '20px' }}>
        <h3>Editor</h3>
          <ModernEditorComponent
            content={content}
            onChange={setContent}
            templates={templates}
            bindings={bindings}
            debug={true}
          />
      </div>

      {/* Preview Section */}
      <div style={{ marginTop: '20px' }}>
        <h3>Preview:</h3>
        <div style={{ 
          backgroundColor: '#ffffff',
          padding: '20px',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          marginTop: '10px'
        }}>
          <div dangerouslySetInnerHTML={{ __html: content }} />
        </div>
      </div>

      {/* Debug Section */}
      <div style={{ marginTop: '20px' }}>
        <h3>Debug: Raw HTML</h3>
        <pre style={{ 
          backgroundColor: '#f5f5f5',
          padding: '15px',
          borderRadius: '4px',
          overflowX: 'auto'
        }}>
          {content}
        </pre>
      </div>
    </div>
  );
}

export default UpdatedExample;