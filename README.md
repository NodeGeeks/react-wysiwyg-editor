# React WYSIWYG Editor
---
## !!UNDER DEVELOPMENT!!
A feature-rich WYSIWYG (What You See Is What You Get) editor component for React applications with support for text formatting, templates, and deeply nested data bindings.
___
## Features

- 📝 Rich text editing with formatting options (bold, italic, underline)
- 🎨 Text color customization
- 📏 Font size adjustment
- 🔗 Link insertion
- 📷 Image embedding
- 📋 Template support
- 🔄 Variable binding support
- ↩️ Undo/Redo functionality
- 🎯 TypeScript support
- ♿ Accessibility features
- 📊 Table support

## Installation

```bash
npm install nodegeeks-react-wysiwyg-editor
# or
yarn add nodegeeks-react-wysiwyg-editor
```

## Usage

### Basic Usage

```tsx
import React, { useState } from 'react';
import { WysiwygEditor } from 'nodegeeks-react-wysiwyg-editor';
import 'nodegeeks-react-wysiwyg-editor/styles.css';

const MyEditor = () => {
  const [content, setContent] = useState('<p>Hello World!</p>');

  return (
    <WysiwygEditor
      content={content}
      setContent={setContent}
    />
  );
};
```

### With Templates and Bindings

```tsx
import React, { useState } from 'react';
import { WysiwygEditor } from 'nodegeeks-react-wysiwyg-editor';
import 'nodegeeks-react-wysiwyg-editor/styles.css';

const MyAdvancedEditor = () => {
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

  const bindings = {
    name: 'John Doe',
    title: 'Monthly Newsletter',
    content: 'Here are the latest updates...'
  };

  return (
    <WysiwygEditor
      content={content}
      setContent={setContent}
      templates={templates}
      bindings={bindings}
    />
  );
};
```

### Basic Usage with Modern Editor

The `ModernEditorComponent` uses DOM Manipulation vs `execCommand`

```tsx
import React from 'react';
import { ModernEditorComponent } from 'react-wysiwyg-editor';

const MyEditor = () => {
  const [content, setContent] = React.useState('');

  return (
    <ModernEditorComponent
      content={content}
      onChange={setContent}
      debug={true} // Optional debug panel
    />
  );
};
```

### With Templates and Data Bindings

```tsx
import React from 'react';
import { ModernEditorComponent } from 'react-wysiwyg-editor';

const MyEditorWithTemplates = () => {
  const [content, setContent] = React.useState('');
  
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
    <ModernEditorComponent
      content={content}
      onChange={setContent}
      templates={templates}
      bindings={bindings}
      debug={true}
    />
  );
};
```

## Key Features

### Modern DOM Manipulation
The editor uses direct DOM manipulation techniques for better performance and stability:
- Direct manipulation of DOM nodes for precise control
- Efficient selection and range management
- Improved content structure handling

### Smart Content Normalization
Automatically maintains clean and consistent content:
- Merges adjacent identical formatting elements
- Ensures proper block structure
- Maintains clean HTML output

### HTML Paste Handling
Advanced paste handling with smart content processing:
- HTML content preservation when available
- Plain text fallback with formatting
- Automatic sanitization of pasted content
- Proper block element handling

### Keyboard Shortcuts
Built-in keyboard shortcuts for common operations:
- Ctrl/Cmd + B: Toggle bold
- Ctrl/Cmd + I: Toggle italic
- Ctrl/Cmd + U: Toggle underline
- Ctrl/Cmd + Z: Undo
- Ctrl/Cmd + Shift + Z: Redo

### Content Sanitization
Comprehensive HTML sanitization:
- Removes unsafe tags and attributes
- Preserves allowed formatting
- Configurable allowed elements and attributes
- Safe handling of pasted content

## Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| content | string | Yes | The HTML content to display in the editor |
| setContent | (content: string) => void | Yes | Callback fired when content changes |
| bindings | Record<string, any> | No | Object containing variable bindings for template interpolation |
| templates | Template[] | No | Array of template objects with name and content properties |
| debug | boolean | No | Enables debug mode for additional logging and Insertion Point/Selection data |

## Template Object

| Property | Type | Description |
|----------|------|-------------|
| name | string | The name of the template |
| content | string | The HTML content of the template |

## Special Thanks

To the [Tabler Icons](https://tabler.io/) project, as these are the icons used.

## Developers take on execCommond
So i spent a ton of time attempting to write some DOM Manipulation techniques to replace the so called "depricated" `execCommand`. Simply because it says its depricated. However after reading a few articles, [this being the main one](https://stackoverflow.com/questions/12251629/is-there-something-better-than-document-execcommand) and a GitHub comments based around [whatwg/html](https://github.com/whatwg/html/pull/7064) repo. With that said i decided to stick with the execCommand usage for the simpler rich text features. However just as other more sophisticated WYSIWYG Editors this should be an end goal. Looking forward to the day i can remove this section from the README ✨ 

## License

MIT License

Copyright (c) 2024 React WYSIWYG Editor

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
