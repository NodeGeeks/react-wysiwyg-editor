# React WYSIWYG Editor
---
## !!UNDER DEVELOPMENT!!
A feature-rich WYSIWYG (What You See Is What You Get) editor component for React applications with support for text formatting, templates, and variable bindings.
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
      onChange={setContent}
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
      onChange={setContent}
      templates={templates}
      bindings={bindings}
    />
  );
};
```

## Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| content | string | Yes | The HTML content to display in the editor |
| onChange | (content: string) => void | Yes | Callback fired when content changes |
| bindings | Record<string, any> | No | Object containing variable bindings for template interpolation |
| templates | Template[] | No | Array of template objects with name and content properties |

## Special Thanks

To the [Tabler Icons](https://tabler.io/) project, as these are the icons used.

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
